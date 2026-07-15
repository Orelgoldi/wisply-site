/** Shared domain types — mirror supabase/migrations/0001_init.sql. */

export type Role = "customer" | "partner" | "admin";
export type PartnerTier = "referrer" | "certified";
export type ReferralStatus = "lead" | "signed" | "active" | "churned";
export type SubStatus = "trialing" | "active" | "past_due" | "canceled";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  site_url: string | null;
  phone: string | null;
  role: Role;
  created_at: string;
};

export type Partner = {
  id: string;
  user_id: string;
  ref_code: string;
  coupon_code: string;
  coupon_percent: number;
  tier: PartnerTier;
  /** Set when the partner asks for certification; granted by us, never self-served. */
  certification_requested_at: string | null;
  certified_at: string | null;
  install_quota: number;
  created_at: string;
};

export type Referral = {
  id: string;
  partner_id: string;
  client_name: string | null;
  client_email: string | null;
  client_site: string | null;
  status: ReferralStatus;
  plan: string | null;
  setup_package: string | null;
  setup_fee: number | null;
  monthly_fee: number | null;
  commission_setup: number | null;
  commission_monthly: number | null;
  installed_by_partner: boolean;
  created_at: string;
  activated_at: string | null;
};

export type Subscription = {
  id: string;
  user_id: string;
  plan: string;
  status: SubStatus;
  monthly_fee: number | null;
  referred_by: string | null;
  started_at: string;
  renews_at: string | null;
};

/** Commission rates per tier — the single source of truth for the whole app. */
export const RATES: Record<PartnerTier, { setup: number; monthly: number; label: string }> = {
  referrer: { setup: 0.25, monthly: 0.15, label: "מפנה" },
  certified: { setup: 0.5, monthly: 0.25, label: "שותף מוסמך" },
};

export const STATUS_LABEL: Record<ReferralStatus, string> = {
  lead: "ליד",
  signed: "נסגר",
  active: "פעיל",
  churned: "עזב",
};

export const ILS = (n: number) =>
  "₪" + Math.round(n).toLocaleString("he-IL");

/** Monthly fee per plan (₪, incl. VAT). Spark is pay-per-conversation, so 0 fixed. */
export const PLAN_FEE: Record<string, number> = {
  spark: 0,
  lite: 99,
  business: 249,
  pro: 549,
  enterprise: 990,
};
