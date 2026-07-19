-- ═══════════════════════════════════════════════════════════════════════════
-- 0003 — Payments (Invoice4U hosted clearing)
-- A paid order is what upgrades a subscription from trialing to active and issues
-- the licence. The customer never writes any of this directly: they create a
-- PENDING order, get redirected to Invoice4U, and only our server — after
-- independently verifying the charge and binding it to THIS order — fulfils it.
-- Re-runnable, like 0001/0002.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── plan_fee( plan ) ────────────────────────────────────────────────────────
-- The single server-side source of truth for prices. The client must NEVER supply
-- an amount: the checkout RPC and fulfilment both derive it here, so a browser
-- calling the RPC directly cannot buy enterprise for ₪1. Mirrors PLAN_FEE in
-- src/lib/types.ts. Returns null for an unknown plan.
create or replace function public.plan_fee( p_plan text )
returns numeric
language sql
immutable
as $$
  select case p_plan
    when 'spark'      then 0
    when 'lite'       then 99
    when 'business'   then 249
    when 'pro'        then 549
    when 'enterprise' then 990
    else null
  end;
$$;

create table if not exists public.payment_orders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  plan        text not null,
  amount      numeric not null check ( amount >= 0 ),
  status      text not null default 'pending' check ( status in ('pending','paid','failed') ),
  payment_id  text,               -- Invoice4U PaymentId, filled on fulfilment
  created_at  timestamptz not null default now(),
  paid_at     timestamptz
);
create index if not exists payment_orders_user_idx on public.payment_orders(user_id);

-- One PaymentId can fulfil at most ONE order — blocks replaying a single real
-- charge across many same-price orders.
create unique index if not exists payment_orders_payment_uidx
  on public.payment_orders(payment_id) where payment_id is not null;

-- Drop the earlier client-amount signature if a pre-fix version ever landed:
-- create-or-replace won't remove a DIFFERENT signature, so the 2-arg form (which
-- trusted a client amount) could otherwise survive and stay callable.
drop function if exists public.create_payment_order( text, numeric );

-- ─── create_payment_order( plan ) ────────────────────────────────────────────
-- Called by the logged-in customer before redirecting to the payment page. The
-- amount is derived server-side from plan_fee() — NOT taken from the client. Only
-- positive-fee plans are chargeable (spark is free, enterprise is contact-only and
-- rejected here). Reuses a recent pending order for the same (user, plan) so a
-- double-click doesn't mint two independently-payable pages.
create or replace function public.create_payment_order( p_plan text )
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_fee numeric := public.plan_fee( p_plan );
  v_id  uuid;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  if v_fee is null then raise exception 'unknown plan'; end if;
  if v_fee <= 0 then raise exception 'plan is not chargeable'; end if;
  if p_plan = 'enterprise' then raise exception 'enterprise is contact-only'; end if;

  -- Reuse an unpaid order from the last 30 minutes for the same plan.
  select id into v_id
    from public.payment_orders
   where user_id = v_uid and plan = p_plan and status = 'pending'
     and created_at > now() - interval '30 minutes'
   order by created_at desc
   limit 1;
  if v_id is not null then return v_id; end if;

  insert into public.payment_orders ( user_id, plan, amount )
  values ( v_uid, p_plan, v_fee )
  returning id into v_id;

  return v_id;
end;
$$;

-- ─── fulfill_payment( order_id, payment_id, amount ) ─────────────────────────
-- Server-only. Runs ONLY after /api/payment/callback has re-queried Invoice4U's
-- clearing log, confirmed IsSuccess, and confirmed the log's OrderIdClientUsage
-- matches this order. Every money-gated guarantee is re-checked HERE, because the
-- callback body is public and untrusted:
--   * amount fails CLOSED — a null/mismatched amount is a rejection, never a skip.
--   * idempotent — a duplicate callback for a paid order is a no-op.
--   * the unique index on payment_id blocks the same charge fulfilling two orders.
-- Mirrors select_plan()'s subscription + partner-commission logic, keyed to the
-- order's user, and marks the subscription ACTIVE (paid).
create or replace function public.fulfill_payment( p_order_id uuid, p_payment_id text, p_amount numeric )
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_order   public.payment_orders;
  v_ref     public.referrals;
  v_tier    text;
  v_rate    numeric := 0;
  v_partner uuid;
begin
  select * into v_order from public.payment_orders where id = p_order_id for update;
  if not found then
    return jsonb_build_object( 'ok', false, 'reason', 'order_not_found' );
  end if;

  -- Idempotency: already fulfilled → succeed without doing anything twice.
  if v_order.status = 'paid' then
    return jsonb_build_object( 'ok', true, 'reason', 'already_paid' );
  end if;

  -- Amount fails CLOSED: no verified numeric amount, or a mismatch, is a rejection.
  if p_amount is null or round( p_amount, 2 ) <> round( v_order.amount, 2 ) then
    update public.payment_orders set status = 'failed' where id = p_order_id;
    return jsonb_build_object( 'ok', false, 'reason', 'amount_mismatch' );
  end if;

  -- Bind the charge to this order. The unique index makes a replay across a second
  -- order raise unique_violation, which we translate to a clean rejection.
  begin
    update public.payment_orders
       set status = 'paid', payment_id = p_payment_id, paid_at = now()
     where id = p_order_id;
  exception when unique_violation then
    return jsonb_build_object( 'ok', false, 'reason', 'payment_already_used' );
  end;

  -- The referral that brought this user in (if any).
  select r.* into v_ref
    from public.referrals r
   where r.client_user_id = v_order.user_id
   order by r.created_at
   limit 1;

  if found then
    v_partner := v_ref.partner_id;
    select tier into v_tier from public.partners where id = v_partner;
    v_rate := case when v_tier = 'certified' then 0.25 else 0.15 end;
  end if;

  insert into public.subscriptions ( user_id, plan, monthly_fee, status, referred_by )
  values ( v_order.user_id, v_order.plan, v_order.amount, 'active', v_partner )
  on conflict ( user_id ) do update
     set plan        = excluded.plan,
         monthly_fee = excluded.monthly_fee,
         status      = 'active',
         referred_by = coalesce( public.subscriptions.referred_by, excluded.referred_by );

  if v_partner is not null then
    update public.referrals
       set plan               = v_order.plan,
           monthly_fee        = v_order.amount,
           commission_monthly = round( v_order.amount * v_rate, 2 ),
           status             = case when status in ('lead','signed') then 'active' else status end
     where id = v_ref.id;
  end if;

  -- Paying is what hands the customer a licence key.
  perform public.issue_license( v_order.user_id, v_order.plan );

  return jsonb_build_object( 'ok', true, 'reason', 'fulfilled' );
end;
$$;

-- ─── Close the free-licence bypass in select_plan ────────────────────────────
-- select_plan (0001 → 0002) was the "record a plan choice" path and it issues a
-- licence. Left open, it hands out an ACTIVE licence for ANY plan with no payment
-- (e.g. the enterprise button). Restrict it to the genuinely free tier; every
-- paid plan must go through checkout → fulfill_payment. CREATE OR REPLACE keeps
-- the signature and all prior behaviour, adds one guard at the top.
create or replace function public.select_plan( p_plan text, p_fee numeric )
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_ref     public.referrals;
  v_tier    text;
  v_rate    numeric := 0;
  v_partner uuid;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;

  -- Only the free tier may be granted here. Paid plans get their licence solely
  -- from a verified payment; this blocks the "click enterprise → free licence" hole.
  if coalesce( public.plan_fee( p_plan ), 1 ) > 0 then
    raise exception 'paid plans must go through checkout';
  end if;

  select r.* into v_ref
    from public.referrals r
   where r.client_user_id = v_uid
   order by r.created_at
   limit 1;

  if found then
    v_partner := v_ref.partner_id;
    select tier into v_tier from public.partners where id = v_partner;
    v_rate := case when v_tier = 'certified' then 0.25 else 0.15 end;
  end if;

  insert into public.subscriptions ( user_id, plan, monthly_fee, status, referred_by )
  values ( v_uid, p_plan, p_fee, 'trialing', v_partner )
  on conflict ( user_id ) do update
     set plan        = excluded.plan,
         monthly_fee = excluded.monthly_fee,
         referred_by = coalesce( public.subscriptions.referred_by, excluded.referred_by );

  if v_partner is not null then
    update public.referrals
       set plan               = p_plan,
           monthly_fee        = p_fee,
           commission_monthly = round( p_fee * v_rate, 2 ),
           status             = case when status = 'lead' then 'signed' else status end
     where id = v_ref.id;
  end if;

  perform public.issue_license( v_uid, p_plan );
end;
$$;

-- ─── RLS + grants ────────────────────────────────────────────────────────────
alter table public.payment_orders enable row level security;

drop policy if exists "own orders read" on public.payment_orders;
create policy "own orders read" on public.payment_orders for select using ( auth.uid() = user_id );

-- No client writes: orders are created via the SECURITY DEFINER RPC and mutated
-- only by the server after payment verification.
revoke insert, update, delete on public.payment_orders from anon, authenticated;

grant execute on function public.create_payment_order( text )         to authenticated;
grant execute on function public.plan_fee( text )                     to anon, authenticated;

-- fulfil is server-only. Revoke from PUBLIC (not just anon — Postgres grants
-- EXECUTE to PUBLIC by default), then grant to service_role alone.
revoke execute on function public.fulfill_payment( uuid, text, numeric ) from anon, authenticated, public;
grant  execute on function public.fulfill_payment( uuid, text, numeric ) to service_role;
