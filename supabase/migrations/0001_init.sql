-- Wisply — initial schema
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query → Run).
--
-- Security model: clients NEVER write privileged columns directly. RLS scopes reads to
-- the owner, column grants stop role/tier self-escalation, and every privileged mutation
-- goes through a SECURITY DEFINER function below.

-- ─── profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  full_name   text,
  email       text,
  site_url    text,
  phone       text,
  role        text not null default 'customer' check (role in ('customer','partner','admin')),
  created_at  timestamptz not null default now()
);

-- ─── partners ────────────────────────────────────────────────────────────────
-- tier: 'referrer' = 25% setup / 15% monthly | 'certified' = 50% / 25%
create table if not exists public.partners (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null unique references public.profiles(id) on delete cascade,
  ref_code                 text not null unique,
  coupon_code              text not null unique,
  coupon_percent           int  not null default 10,
  tier                     text not null default 'referrer' check (tier in ('referrer','certified')),
  -- Certification is REQUESTED by the partner and granted by us — never self-granted.
  certification_requested_at timestamptz,
  certified_at             timestamptz,
  install_quota            int  not null default 2,   -- certified: up to N installs/month
  created_at               timestamptz not null default now()
);

-- ─── referrals ───────────────────────────────────────────────────────────────
create table if not exists public.referrals (
  id                 uuid primary key default gen_random_uuid(),
  partner_id         uuid not null references public.partners(id) on delete cascade,
  -- Set when the referred visitor actually signs up, so a plan choice can find this row.
  client_user_id     uuid references public.profiles(id) on delete set null,
  client_name        text,
  client_email       text,
  client_site        text,
  status             text not null default 'lead' check (status in ('lead','signed','active','churned')),
  plan               text,
  setup_package      text,
  setup_fee          numeric(10,2) default 0,
  monthly_fee        numeric(10,2) default 0,
  commission_setup   numeric(10,2) default 0,
  commission_monthly numeric(10,2) default 0,
  installed_by_partner boolean not null default false,
  created_at         timestamptz not null default now(),
  activated_at       timestamptz
);
create index if not exists referrals_partner_idx on public.referrals(partner_id);
create index if not exists referrals_client_idx  on public.referrals(client_user_id);
create index if not exists referrals_created_idx on public.referrals(created_at desc);

-- ─── subscriptions ───────────────────────────────────────────────────────────
create table if not exists public.subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references public.profiles(id) on delete cascade,
  plan         text not null default 'spark',
  status       text not null default 'trialing' check (status in ('trialing','active','past_due','canceled')),
  monthly_fee  numeric(10,2) default 0,
  referred_by  uuid references public.partners(id) on delete set null,
  started_at   timestamptz not null default now(),
  renews_at    timestamptz
);
create index if not exists subscriptions_user_idx on public.subscriptions(user_id);

-- ─── signup: create the profile AND claim the referral ───────────────────────
-- The ref_code travels in raw_user_meta_data (set by the signup action from /signup?ref=).
-- Claiming it here is what makes the partner portal show real numbers.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_ref     text;
  v_partner uuid;
begin
  insert into public.profiles (id, email, full_name, site_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'site_url'
  )
  on conflict (id) do nothing;

  v_ref := nullif( trim( new.raw_user_meta_data ->> 'ref_code' ), '' );
  if v_ref is not null then
    select id into v_partner from public.partners where ref_code = lower( v_ref );
    if v_partner is not null then
      insert into public.referrals ( partner_id, client_user_id, client_name, client_email, client_site, status )
      values (
        v_partner,
        new.id,
        new.raw_user_meta_data ->> 'full_name',
        new.email,
        new.raw_user_meta_data ->> 'site_url',
        'lead'
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── join the partner programme (generates codes, flips role) ────────────────
create or replace function public.join_partner()
returns public.partners
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_base text;
  v_row  public.partners;
  i      int := 0;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;

  select id into v_row from public.partners where user_id = v_uid;
  if found then return v_row; end if;

  -- Slug from the user's name/email, then a random suffix for uniqueness.
  select lower( regexp_replace( coalesce( nullif( split_part( coalesce( p.full_name, p.email, 'partner' ), ' ', 1 ), '' ), 'partner' ), '[^a-z0-9]', '', 'gi' ) )
    into v_base from public.profiles p where p.id = v_uid;
  v_base := left( coalesce( nullif( v_base, '' ), 'partner' ), 12 );

  loop
    i := i + 1;
    begin
      insert into public.partners ( user_id, ref_code, coupon_code )
      values (
        v_uid,
        v_base || substr( md5( random()::text ), 1, 4 ),
        'WISPLY' || upper( substr( md5( random()::text ), 1, 4 ) )
      )
      returning * into v_row;
      exit;
    exception when unique_violation then
      if i >= 5 then raise; end if;   -- retry with fresh codes
    end;
  end loop;

  update public.profiles set role = 'partner' where id = v_uid and role = 'customer';
  return v_row;
end;
$$;

-- ─── request certification (does NOT grant it) ───────────────────────────────
create or replace function public.request_certification()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  update public.partners
     set certification_requested_at = coalesce( certification_requested_at, now() )
   where user_id = auth.uid() and tier = 'referrer';
end;
$$;

-- ─── choose a plan (writes the subscription AND the partner's commission) ────
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

  -- The referral that brought this user in (if any).
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

  -- Keep the partner's commission in sync with what the client actually picked.
  if v_partner is not null then
    update public.referrals
       set plan               = p_plan,
           monthly_fee        = p_fee,
           commission_monthly = round( p_fee * v_rate, 2 ),
           status             = case when status = 'lead' then 'signed' else status end
     where id = v_ref.id;
  end if;
end;
$$;

-- ─── RLS: read your own rows ─────────────────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.partners      enable row level security;
alter table public.referrals     enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "own profile" on public.profiles;
drop policy if exists "own profile read"   on public.profiles;
drop policy if exists "own profile update" on public.profiles;
create policy "own profile read"   on public.profiles for select using ( auth.uid() = id );
create policy "own profile update" on public.profiles for update using ( auth.uid() = id ) with check ( auth.uid() = id );

drop policy if exists "own partner" on public.partners;
create policy "own partner read" on public.partners for select using ( auth.uid() = user_id );

drop policy if exists "own referrals" on public.referrals;
create policy "own referrals read" on public.referrals for select using (
  exists ( select 1 from public.partners p where p.id = referrals.partner_id and p.user_id = auth.uid() )
);

drop policy if exists "own subscription" on public.subscriptions;
create policy "own subscription read" on public.subscriptions for select using ( auth.uid() = user_id );

-- ─── Column/table grants: block privilege self-escalation ────────────────────
-- Without this, "own profile update" would let any user set role='admin', and a partner
-- set tier='certified', straight from the browser with the anon key.
revoke update on public.profiles from authenticated;
grant  update ( full_name, site_url, phone ) on public.profiles to authenticated;

revoke insert, update, delete on public.partners      from authenticated;
revoke insert, update, delete on public.referrals     from authenticated;
revoke insert, update, delete on public.subscriptions from authenticated;

grant execute on function public.join_partner()                    to authenticated;
grant execute on function public.request_certification()           to authenticated;
grant execute on function public.select_plan( text, numeric )      to authenticated;
