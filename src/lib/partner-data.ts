import { createClient } from "@/lib/supabase/server";
import type { Partner, Profile, Referral } from "@/lib/types";

export type PartnerStats = {
  referrals: number;
  activeClients: number;
  /** Recurring commission already earned (clients actually paying). */
  earnedMonthly: number;
  /** Signed but not yet active — money on the way, not yet earned. */
  pendingMonthly: number;
  setupTotal: number;
  /** Everything earned since joining: setup commissions + active recurring. */
  lifetime: number;
};

export type MonthPoint = { label: string; value: number };

export async function getPartnerContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: partner }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>(),
    supabase.from("partners").select("*").eq("user_id", user.id).maybeSingle<Partner>(),
  ]);

  let referrals: Referral[] = [];
  if (partner) {
    const { data } = await supabase
      .from("referrals")
      .select("*")
      .eq("partner_id", partner.id)
      .order("created_at", { ascending: false });
    referrals = (data as Referral[]) ?? [];
  }

  return { user, profile: profile ?? null, partner: partner ?? null, referrals };
}

export function computeStats(referrals: Referral[]): PartnerStats {
  const num = (v: number | null | undefined) => Number(v ?? 0);
  const active = referrals.filter((r) => r.status === "active");
  const signed = referrals.filter((r) => r.status === "signed");

  const earnedMonthly = active.reduce((s, r) => s + num(r.commission_monthly), 0);
  const pendingMonthly = signed.reduce((s, r) => s + num(r.commission_monthly), 0);
  const setupTotal = referrals.reduce((s, r) => s + num(r.commission_setup), 0);

  return {
    referrals: referrals.length,
    activeClients: active.length,
    earnedMonthly,
    pendingMonthly,
    setupTotal,
    lifetime: setupTotal + earnedMonthly,
  };
}

const MONTHS_HE = ["ינו", "פבר", "מרץ", "אפר", "מאי", "יונ", "יול", "אוג", "ספט", "אוק", "נוב", "דצמ"];

/**
 * Recurring commission per month for the last 6 months, counted from the month a
 * referral became active. Returns real zeros when there is nothing yet — we never
 * fabricate a trend line.
 */
export function earningsByMonth(referrals: Referral[], now = new Date()): MonthPoint[] {
  const out: MonthPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const value = referrals
      .filter((r) => {
        if (r.status !== "active" || !r.activated_at) return false;
        return new Date(r.activated_at) < end;
      })
      .reduce((s, r) => s + Number(r.commission_monthly ?? 0), 0);
    out.push({ label: MONTHS_HE[d.getMonth()], value });
  }
  return out;
}
