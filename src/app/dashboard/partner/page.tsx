import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CopyField } from "./CopyField";
import { joinPartner, requestCertification } from "./actions";
import { siteUrl } from "@/lib/site";
import { RATES, STATUS_LABEL, ILS } from "@/lib/types";
import type { Partner, Referral, ReferralStatus } from "@/lib/types";

const pct = (n: number) => `${Math.round(n * 100)}%`;

const STATUS_PILL: Record<ReferralStatus, string> = {
  lead: "bg-cloud text-ink-soft",
  signed: "bg-gold/15 text-ink",
  active: "bg-brand/12 text-brand-700",
  churned: "bg-mist/15 text-mist",
};

const dateHe = (iso: string) =>
  new Date(iso).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });

export default async function PartnerPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const { err } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: partner } = await supabase
    .from("partners")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<Partner>();

  if (!partner) return <JoinScreen error={err} />;

  const { data } = await supabase
    .from("referrals")
    .select("*")
    .eq("partner_id", partner.id)
    .order("created_at", { ascending: false });
  const referrals: Referral[] = data ?? [];

  const active = referrals.filter((r) => r.status === "active");
  const setupTotal = referrals.reduce((sum, r) => sum + Number(r.commission_setup ?? 0), 0);
  const monthlyTotal = active.reduce((sum, r) => sum + Number(r.commission_monthly ?? 0), 0);

  const rate = RATES[partner.tier];
  const site = siteUrl();
  const refLink = `${site}/signup?ref=${partner.ref_code}`;

  async function requestUpgrade() {
    "use server";
    const result = await requestCertification();
    if (result) redirect(`/dashboard/partner?err=${encodeURIComponent(result.error)}`);
  }

  return (
    <div className="space-y-8">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">פורטל שותפים</h1>
          <p className="mt-1.5 text-[15px] text-ink-soft">
            הלינק, הקופון והעמלות שלכם — הכל כאן.
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-white px-5 py-3 shadow-[var(--shadow-card)]">
          <div className="text-[15px] font-extrabold text-ink">{rate.label}</div>
          <div className="mt-0.5 text-[13px] font-semibold text-brand-700">
            {pct(rate.setup)} הקמה · {pct(rate.monthly)} מנוי
          </div>
        </div>
      </div>

      {err && <ErrorNote>{err}</ErrorNote>}

      {/* link + coupon */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-line bg-white p-6 shadow-[var(--shadow-card)]">
          <CopyField label="לינק ההפניה שלי" value={refLink} />
          <p className="mt-3 text-[13.5px] leading-relaxed text-mist">
            כל מי שנרשם דרך הלינק הזה נרשם אליכם אוטומטית.
          </p>
        </div>
        <div className="rounded-3xl border border-line bg-white p-6 shadow-[var(--shadow-card)]">
          <CopyField label="קופון ההנחה שלי" value={partner.coupon_code} />
          <p className="mt-3 text-[13.5px] leading-relaxed text-mist">
            {partner.coupon_percent}% הנחה ללקוח — בלי לגעת בעמלה שלכם.
          </p>
        </div>
      </div>

      {/* earnings */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="הפניות" value={String(referrals.length)} />
        <Stat label="פעילים" value={String(active.length)} />
        <Stat label="עמלות הקמה" value={ILS(setupTotal)} accent />
        <Stat label="עמלה חודשית מתגלגלת" value={ILS(monthlyTotal)} suffix="/חודש" accent />
      </div>

      {/* referrals table */}
      <div className="rounded-3xl border border-line bg-white p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-xl font-extrabold text-ink">ההפניות שלי</h2>
        {referrals.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-line bg-cloud px-5 py-10 text-center text-[15px] text-ink-soft">
            עדיין אין הפניות — שתפו את הלינק שלכם כדי להתחיל.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-[14px]">
              <thead>
                <tr className="text-mist">
                  <th className="py-2 text-right font-semibold">לקוח</th>
                  <th className="py-2 text-right font-semibold">סטטוס</th>
                  <th className="py-2 text-right font-semibold">מסלול</th>
                  <th className="py-2 text-right font-semibold">עמלת הקמה</th>
                  <th className="py-2 text-right font-semibold">עמלה חודשית</th>
                  <th className="py-2 text-right font-semibold">תאריך</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r) => (
                  <tr key={r.id} className="border-t border-line align-middle">
                    <td className="py-3.5 pl-4">
                      <div className="font-semibold text-ink">{r.client_name ?? "—"}</div>
                      {r.client_site && (
                        <div dir="ltr" className="text-right text-[13px] text-mist">
                          {r.client_site}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 pl-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-[12.5px] font-bold ${STATUS_PILL[r.status]}`}
                      >
                        {STATUS_LABEL[r.status]}
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-ink-soft">{r.plan ?? "—"}</td>
                    <td className="py-3.5 pl-4 font-bold text-brand-700">
                      {ILS(Number(r.commission_setup ?? 0))}
                    </td>
                    <td className="py-3.5 pl-4 font-bold text-brand-700">
                      {ILS(Number(r.commission_monthly ?? 0))}
                    </td>
                    <td className="py-3.5 text-ink-soft">{dateHe(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* tier block */}
      {partner.tier === "referrer" ? (
        <div className="rounded-3xl border-2 border-brand bg-white p-8 shadow-[var(--shadow-soft)]">
          <h2 className="text-xl font-extrabold text-ink">שדרוג לשותף מוסמך</h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            שותף מוסמך מקבל עמלה כפולה: {pct(RATES.certified.setup)} מההקמה ו-
            {pct(RATES.certified.monthly)} מהמנוי כל חודש, במקום {pct(RATES.referrer.setup)} ו-
            {pct(RATES.referrer.monthly)} היום.
          </p>

          <div className="mt-6 rounded-2xl border border-line bg-cloud p-5">
            <div className="text-[14px] font-bold text-ink">מה אתם מתחייבים אליו</div>
            <ul className="mt-2.5 space-y-2 text-[14.5px] text-ink-soft">
              <li>• להתקין עד {partner.install_quota} אתרים בחודש.</li>
              <li>• לעבור הדרכת הסמכה לפני ההתקנה הראשונה.</li>
            </ul>
          </div>

          {partner.certification_requested_at ? (
            <div className="mt-6 rounded-2xl border border-brand/30 bg-brand/5 px-5 py-4">
              <div className="text-[15px] font-bold text-brand-700">בקשתכם נשלחה ✓</div>
              <p className="mt-1 text-[14px] text-ink-soft">
                ניצור איתכם קשר לתיאום הדרכת ההסמכה. עד לאישור, העמלות נשארות במסלול מפנה.
              </p>
            </div>
          ) : (
            <form action={requestUpgrade}>
              <button
                type="submit"
                className="mt-6 rounded-full bg-accent px-7 py-3 text-[15px] font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,122,89,0.7)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                שליחת בקשה
              </button>
              <p className="mt-2.5 text-[13px] text-mist">
                הבקשה נשלחת לאישורנו — השדרוג נכנס לתוקף אחרי הדרכת ההסמכה.
              </p>
            </form>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-line bg-white p-8 shadow-[var(--shadow-card)]">
          <h2 className="text-xl font-extrabold text-ink">
            אתם שותפים מוסמכים · מכסת התקנות: {partner.install_quota} אתרים בחודש
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
            העמלות שלכם: {pct(RATES.certified.setup)} מההקמה ו-{pct(RATES.certified.monthly)} מהמנוי
            כל חודש, כל עוד הלקוח פעיל.
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── join screen ─────────────────────────────────────────────────────────── */

async function JoinScreen({ error }: { error?: string }) {
  async function join() {
    "use server";
    const result = await joinPartner();
    if (result) redirect(`/dashboard/partner?err=${encodeURIComponent(result.error)}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        הצטרפו לתוכנית השותפים
      </h1>
      <p className="mt-3 text-[16px] leading-relaxed text-ink-soft">
        מקבלים לינק הפניה קבוע וקופון הנחה אישי. כל לקוח שמגיע דרככם מזוכה לכם אוטומטית —
        עמלה על ההקמה, ועוד סכום שמתגלגל כל חודש שהלקוח פעיל. בלי עלות ובלי התחייבות.
      </p>

      {error && <div className="mt-6"><ErrorNote>{error}</ErrorNote></div>}

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <TierCard tier="referrer" note="אתם מפנים, אנחנו מקימים ומתמכים." />
        <TierCard
          tier="certified"
          note="אתם מקימים ומחברים, אנחנו נותנים מוצר וגב. בכפוף להדרכת הסמכה."
          featured
        />
      </div>

      <form action={join}>
        <button
          type="submit"
          className="mt-8 rounded-full bg-accent px-8 py-3.5 text-[16px] font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,122,89,0.7)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          הצטרפות חינם
        </button>
      </form>
      <p className="mt-3 text-[13.5px] text-mist">
        מתחילים במסלול מפנה. אפשר לבקש שדרוג לשותף מוסמך בכל שלב מתוך הפורטל.
      </p>
    </div>
  );
}

function TierCard({
  tier,
  note,
  featured,
}: {
  tier: keyof typeof RATES;
  note: string;
  featured?: boolean;
}) {
  const rate = RATES[tier];
  return (
    <div
      className={
        featured
          ? "relative rounded-3xl border-2 border-brand bg-white p-8 shadow-[var(--shadow-soft)]"
          : "rounded-3xl border border-line bg-white p-8 shadow-[var(--shadow-card)]"
      }
    >
      {featured && (
        <div className="absolute -top-3 right-8 rounded-full bg-brand-700 px-3 py-1 text-[11px] font-bold text-white">
          הכי משתלם
        </div>
      )}
      <h3 className="text-xl font-extrabold text-ink">{rate.label}</h3>
      <p className="mt-1 text-[14px] leading-relaxed text-mist">{note}</p>
      <div className="mt-5 flex gap-6">
        <div>
          <div className="grad-text text-3xl font-extrabold">{pct(rate.setup)}</div>
          <div className="text-[13px] text-mist">מההקמה</div>
        </div>
        <div>
          <div className="grad-text text-3xl font-extrabold">{pct(rate.monthly)}</div>
          <div className="text-[13px] text-mist">מהמנוי / חודש</div>
        </div>
      </div>
    </div>
  );
}

/* ─── bits ────────────────────────────────────────────────────────────────── */

function Stat({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: string;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-line bg-white p-6 shadow-[var(--shadow-card)]">
      <div className="text-[13.5px] font-semibold text-mist">{label}</div>
      <div className={`mt-2 text-3xl font-extrabold ${accent ? "grad-text" : "text-ink"}`}>
        {value}
        {suffix && <span className="text-base font-medium text-mist">{suffix}</span>}
      </div>
    </div>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-accent/30 bg-accent/10 px-5 py-3.5 text-[14.5px] font-semibold text-ink">
      {children}
    </div>
  );
}
