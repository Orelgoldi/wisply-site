-- Wisply — licensing + auto-updates
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query → Run), after 0001_init.sql.
--
-- Security model: same as 0001 — clients NEVER write these tables directly. RLS scopes reads to
-- the owner, writes are revoked from the client roles, and every mutation goes through a
-- SECURITY DEFINER function below.
--
-- One twist vs 0001: the WordPress plugin has NO user session. It authenticates with the license
-- key itself, so license_activate / license_check / license_deactivate are callable by `anon`.
-- The key IS the credential — that is why those functions look up by key and never trust auth.uid().

create extension if not exists pgcrypto with schema extensions;

-- ─── licenses ────────────────────────────────────────────────────────────────
create table if not exists public.licenses (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  plan        text not null default 'spark',
  status      text not null default 'active' check (status in ('active','suspended','canceled')),
  sites_limit int  not null default 1,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz            -- null = perpetual
);
create index if not exists licenses_user_idx on public.licenses(user_id);

-- ─── license_activations ─────────────────────────────────────────────────────
-- site_url is stored normalized (see normalize_site) so "https://Foo.co.il/" and "foo.co.il"
-- are the SAME site and can't be used to burn two slots of the quota.
create table if not exists public.license_activations (
  id           uuid primary key default gen_random_uuid(),
  license_id   uuid not null references public.licenses(id) on delete cascade,
  site_url     text not null,
  activated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (license_id, site_url)
);
create index if not exists license_activations_license_idx on public.license_activations(license_id);

-- ─── releases ────────────────────────────────────────────────────────────────
-- is_current marks the one release the update endpoint serves.
create table if not exists public.releases (
  id          uuid primary key default gen_random_uuid(),
  version     text not null,                    -- e.g. '2.6.0'
  zip_path    text not null,                    -- Supabase Storage path
  changelog   text,
  released_at timestamptz not null default now(),
  is_current  boolean not null default false
);
-- UNIQUE, not just indexed: a partial unique index on a constant predicate allows at
-- most ONE row with is_current = true. Publishing is a manual dashboard action, and
-- forgetting to clear the previous flag would leave two current rows — which makes the
-- .maybeSingle() in /api/update fail, which returns "no update available" to every
-- install on earth, forever, with no error logged anywhere. Let the database refuse
-- instead: an honest error at publish time beats a silent dead update channel.
create unique index if not exists releases_current_idx on public.releases(is_current) where is_current;
create unique index if not exists releases_version_uidx on public.releases(version);

-- ─── site url normalization ──────────────────────────────────────────────────
-- Drops the scheme, "www.", any path/query and the trailing slash, then lowercases.
create or replace function public.normalize_site( p_site text )
returns text
language sql
immutable
as $$
  select nullif(
    regexp_replace(
      regexp_replace(
        regexp_replace( lower( trim( coalesce( p_site, '' ) ) ), '^[a-z]+://', '' ),
        '^www\.', ''
      ),
      '[/?#].*$', ''
    ),
    ''
  );
$$;

-- ─── license key generator: WSP-XXXX-XXXX-XXXX-XXXX ──────────────────────────
-- Cryptographically random (pgcrypto), NOT random()/md5() — a guessable key is a free license.
-- Rejection sampling (252 = 36 × 7) keeps every character equally likely instead of biasing
-- the first 4 letters of the alphabet the way a plain byte % 36 would.
create or replace function public.gen_license_key()
returns text
language plpgsql
volatile
set search_path = public, extensions
as $$
declare
  v_alpha constant text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  v_out   text := '';
  v_byte  int;
begin
  while length( v_out ) < 16 loop
    v_byte := get_byte( gen_random_bytes(1), 0 );
    if v_byte < 252 then
      v_out := v_out || substr( v_alpha, ( v_byte % 36 ) + 1, 1 );
    end if;
  end loop;

  return 'WSP-' || substr( v_out, 1, 4 )
       || '-'   || substr( v_out, 5, 4 )
       || '-'   || substr( v_out, 9, 4 )
       || '-'   || substr( v_out, 13, 4 );
end;
$$;

-- ─── sites_limit per plan ────────────────────────────────────────────────────
create or replace function public.plan_sites_limit( p_plan text )
returns int
language sql
immutable
as $$
  select case lower( coalesce( p_plan, '' ) )
    when 'spark'      then 1
    when 'lite'       then 1
    when 'business'   then 3
    when 'pro'        then 10
    when 'enterprise' then 50
    else 1
  end;
$$;

-- ─── issue a license (idempotent per user) ───────────────────────────────────
-- Returns the user's existing license if there is one — the key a customer already installed
-- must NEVER change under them. On a plan change we keep the key and re-point plan/sites_limit.
create or replace function public.issue_license( p_user uuid, p_plan text )
returns public.licenses
language plpgsql
security definer set search_path = public
as $$
declare
  v_row public.licenses;
  i     int := 0;
begin
  if p_user is null then raise exception 'issue_license: user is required'; end if;

  select * into v_row
    from public.licenses
   where user_id = p_user
   order by created_at
   limit 1;

  if found then
    update public.licenses
       set plan        = coalesce( p_plan, plan ),
           sites_limit = greatest( sites_limit, public.plan_sites_limit( coalesce( p_plan, plan ) ) )
     where id = v_row.id
    returning * into v_row;
    return v_row;
  end if;

  loop
    i := i + 1;
    begin
      insert into public.licenses ( key, user_id, plan, sites_limit )
      values (
        public.gen_license_key(),
        p_user,
        coalesce( p_plan, 'spark' ),
        public.plan_sites_limit( p_plan )
      )
      returning * into v_row;
      exit;
    exception when unique_violation then
      if i >= 5 then raise; end if;   -- retry with a fresh key
    end;
  end loop;

  return v_row;
end;
$$;

-- ─── choose a plan (subscription + partner commission + license) ─────────────
-- Redefined from 0001 with the SAME signature and ALL of its behaviour — the subscription upsert
-- and the partner commission below are copied across verbatim, only the license issue is new.
-- Do NOT drop this function: the plan page and the partner payouts both depend on it.
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

  -- New in 0002: picking a plan is what hands the customer a license key.
  perform public.issue_license( v_uid, p_plan );
end;
$$;

-- ─── license lookup shared by the three public RPCs ──────────────────────────
-- Returns the license row for a key only when it is genuinely usable; the callers turn a
-- null result into the Hebrew failure payload the plugin shows the site owner.
create or replace function public.license_resolve( p_key text )
returns public.licenses
language sql
stable
security definer set search_path = public
as $$
  select * from public.licenses
   where key = upper( trim( coalesce( p_key, '' ) ) )
   limit 1;
$$;

-- ─── license_activate( key, site ) ───────────────────────────────────────────
-- Upserts the activation. A site that is ALREADY activated always re-activates (a reinstall or
-- a plugin re-save must never be blocked by the quota); only a NEW site consumes a slot.
create or replace function public.license_activate( p_key text, p_site text )
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_lic   public.licenses;
  v_site  text := public.normalize_site( p_site );
  v_used  int;
  v_known boolean;
begin
  if v_site is null then
    return jsonb_build_object( 'ok', false, 'reason', 'bad_site', 'message', 'כתובת האתר חסרה או לא תקינה' );
  end if;

  v_lic := public.license_resolve( p_key );

  if v_lic.id is null then
    return jsonb_build_object( 'ok', false, 'reason', 'not_found', 'message', 'מפתח רישיון לא תקין' );
  end if;

  -- Serialise every activation of THIS licence. Without the lock two sites can both
  -- read sites_used = 0 against sites_limit = 1 and both insert (the unique index is
  -- on (license_id, site_url), so different sites never collide) — quota exceeded.
  --
  -- Re-read the row THROUGH the lock: v_lic above is a pre-lock snapshot, so a plan
  -- upgrade committing while we waited would leave us comparing a fresh sites_used
  -- against a stale sites_limit and falsely rejecting a site the customer just paid
  -- for. Lock and value must come from the same moment.
  select * into v_lic from public.licenses where id = v_lic.id for update;

  if v_lic.status <> 'active' then
    return jsonb_build_object(
      'ok', false, 'reason', v_lic.status, 'status', v_lic.status, 'plan', v_lic.plan,
      'sites_limit', v_lic.sites_limit,
      'message', 'הרישיון אינו פעיל'
    );
  end if;

  if v_lic.expires_at is not null and v_lic.expires_at <= now() then
    return jsonb_build_object(
      'ok', false, 'reason', 'expired', 'status', v_lic.status, 'plan', v_lic.plan,
      'sites_limit', v_lic.sites_limit,
      'message', 'תוקף הרישיון פג'
    );
  end if;

  select exists (
    select 1 from public.license_activations
     where license_id = v_lic.id and site_url = v_site
  ) into v_known;

  select count(*) into v_used from public.license_activations where license_id = v_lic.id;

  if not v_known and v_used >= v_lic.sites_limit then
    return jsonb_build_object(
      'ok', false, 'reason', 'quota', 'status', v_lic.status, 'plan', v_lic.plan,
      'sites_used', v_used, 'sites_limit', v_lic.sites_limit,
      'message', 'חרגתם ממכסת האתרים לרישיון הזה'
    );
  end if;

  insert into public.license_activations ( license_id, site_url )
  values ( v_lic.id, v_site )
  on conflict ( license_id, site_url ) do update
     set last_seen_at = now();

  select count(*) into v_used from public.license_activations where license_id = v_lic.id;

  return jsonb_build_object(
    'ok', true, 'reason', 'ok', 'status', v_lic.status, 'plan', v_lic.plan,
    'sites_used', v_used, 'sites_limit', v_lic.sites_limit,
    'message', 'הרישיון הופעל בהצלחה'
  );
end;
$$;

-- ─── license_check( key, site ) ──────────────────────────────────────────────
-- The heartbeat: same payload shape as activate, but it NEVER inserts an activation —
-- otherwise a site could quietly onboard itself past the quota just by polling.
create or replace function public.license_check( p_key text, p_site text )
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_lic  public.licenses;
  v_site text := public.normalize_site( p_site );
  v_used int;
  v_hit  boolean;
begin
  if v_site is null then
    return jsonb_build_object( 'ok', false, 'reason', 'bad_site', 'message', 'כתובת האתר חסרה או לא תקינה' );
  end if;

  v_lic := public.license_resolve( p_key );

  if v_lic.id is null then
    return jsonb_build_object( 'ok', false, 'reason', 'not_found', 'message', 'מפתח רישיון לא תקין' );
  end if;

  update public.license_activations
     set last_seen_at = now()
   where license_id = v_lic.id and site_url = v_site;

  v_hit := found;

  select count(*) into v_used from public.license_activations where license_id = v_lic.id;

  if v_lic.status <> 'active' then
    return jsonb_build_object(
      'ok', false, 'reason', v_lic.status, 'status', v_lic.status, 'plan', v_lic.plan,
      'sites_used', v_used, 'sites_limit', v_lic.sites_limit,
      'message', 'הרישיון אינו פעיל'
    );
  end if;

  if v_lic.expires_at is not null and v_lic.expires_at <= now() then
    return jsonb_build_object(
      'ok', false, 'reason', 'expired', 'status', v_lic.status, 'plan', v_lic.plan,
      'sites_used', v_used, 'sites_limit', v_lic.sites_limit,
      'message', 'תוקף הרישיון פג'
    );
  end if;

  if not v_hit then
    return jsonb_build_object(
      'ok', false, 'reason', 'not_activated', 'status', v_lic.status, 'plan', v_lic.plan,
      'sites_used', v_used, 'sites_limit', v_lic.sites_limit,
      'message', 'האתר הזה לא מופעל עבור הרישיון הזה'
    );
  end if;

  return jsonb_build_object(
    'ok', true, 'reason', 'ok', 'status', v_lic.status, 'plan', v_lic.plan,
    'sites_used', v_used, 'sites_limit', v_lic.sites_limit,
    'message', 'הרישיון תקף'
  );
end;
$$;

-- ─── license_deactivate( key, site ) ─────────────────────────────────────────
-- Frees the slot so the customer can move the plugin to another site on their own.
create or replace function public.license_deactivate( p_key text, p_site text )
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_lic  public.licenses;
  v_site text := public.normalize_site( p_site );
begin
  v_lic := public.license_resolve( p_key );

  if v_lic.id is null or v_site is null then
    return jsonb_build_object( 'ok', false );
  end if;

  -- The key alone is NOT authority to free a seat: keys travel through support
  -- tickets, screenshots and resellers. Only the licence's owner may deactivate.
  if auth.uid() is null or auth.uid() <> v_lic.user_id then
    return jsonb_build_object( 'ok', false, 'reason', 'forbidden' );
  end if;

  delete from public.license_activations
   where license_id = v_lic.id and site_url = v_site;

  return jsonb_build_object( 'ok', true );
end;
$$;

-- ─── RLS: read your own rows ─────────────────────────────────────────────────
alter table public.licenses            enable row level security;
alter table public.license_activations enable row level security;
alter table public.releases            enable row level security;

drop policy if exists "own license read" on public.licenses;
create policy "own license read" on public.licenses for select using ( auth.uid() = user_id );

drop policy if exists "own license activations read" on public.license_activations;
create policy "own license activations read" on public.license_activations for select using (
  exists (
    select 1 from public.licenses l
     where l.id = license_activations.license_id and l.user_id = auth.uid()
  )
);

-- Releases carry no customer data, but zip_path is the exact Storage path of the
-- product zip — handing it to anyone holding the public anon key is a free map to
-- the artifact. /api/update and /api/download read this table with the service-role
-- client instead (which bypasses RLS), so no client role needs read at all.
drop policy if exists "releases read" on public.releases;

-- ─── Storage: the product zip ────────────────────────────────────────────────
-- PRIVATE, and deliberately with no storage.objects policy: no client role may read
-- it at all. Only /api/download reaches it, with the service-role client, and only
-- after a live licence check. A public bucket would make the whole licence gate
-- theatre — the zip would be one guessable URL away.
insert into storage.buckets ( id, name, public )
values ( 'releases', 'releases', false )
on conflict ( id ) do update set public = false;

-- ─── Table grants: block self-issued licenses and quota edits ────────────────
-- Without this, the RLS read policies would still leave insert/update/delete open from the
-- browser with the anon key — a customer could set sites_limit = 999 or mint their own key.
revoke insert, update, delete on public.licenses            from anon, authenticated;
revoke insert, update, delete on public.license_activations from anon, authenticated;
revoke insert, update, delete on public.releases            from anon, authenticated;

-- releases is served only through /api/update and /api/download (service-role).
revoke select on public.releases from anon, authenticated;

-- The plugin calls these UNAUTHENTICATED — the license key is the credential.
grant execute on function public.license_activate( text, text ) to anon, authenticated;
grant execute on function public.license_check( text, text )    to anon, authenticated;

-- license_deactivate is NOT granted to anon: knowing a key would then be enough to
-- delete a paying customer's activation and (once the gate bites) take their bot
-- down. Freeing a seat is an account action — it belongs in the portal, under a
-- real session, not behind a key that travels in support tickets and screenshots.
-- ...from PUBLIC, not just anon: Postgres grants EXECUTE on every new function to
-- PUBLIC by default, and anon inherits it from there. Revoking "from anon" alone
-- leaves that inherited grant untouched and the revoke silently does nothing.
revoke execute on function public.license_deactivate( text, text ) from anon, authenticated, public;
grant  execute on function public.license_deactivate( text, text ) to authenticated;

-- Issuing and key generation stay server-side only: no client role gets execute.
revoke execute on function public.issue_license( uuid, text )  from anon, authenticated, public;
revoke execute on function public.gen_license_key()            from anon, authenticated, public;
revoke execute on function public.license_resolve( text )      from anon, authenticated, public;

grant execute on function public.select_plan( text, numeric ) to authenticated;
