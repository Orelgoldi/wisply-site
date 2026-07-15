import Link from "next/link";
import { redirect } from "next/navigation";
import { joinPartner, requestCertification } from "./actions";
import { CopyField } from "./CopyField";
import { siteUrl } from "@/lib/site";
import { getPartnerContext, computeStats, earningsByMonth } from "@/lib/partner-data";
import { MintCard, PlainCard, Stat, Steps, EarningsChart } from "@/components/dash/Cards";
import { RATES, STATUS_LABEL, ILS } from "@/lib/types";
import type { ReferralStatus } from "@/lib/types";

const pct = (n: number) => `${Math.round(n * 100)}%`;

const STATUS_PILL: Record<ReferralStatus, string> = {
  lead: "bg-shell text-ink-soft",
  signed: "bg-gold/20 text-[#8a5a00]",
  active: "bg-mint/30 text-mint-700",
  churned: "bg-accent/10 text-accent-600",
};

export default async function PartnerPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const { err } = await searchParams;
  const ctx = await getPartnerContext();
  if (!ctx) redirect("/login");
  const { partner, referrals } = ctx;

  // ── Not a partner yet → join screen ──
  if (!partner) {
    async function join() {
      "use server";
      const r = await joinPartner();
      if (r) redirect(`/dashboard/partner?err=${encodeURIComponent(r.error)}`);
    }
    return (
      <div className="mx-auto max-w-3xl">
        <PlainCard
          title="הצטרפו לתוכנית השותפים"
          subtitle="הרוויחו על כל לקוח שתביאו — גם חד-פעמית וגם כל חודש"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {(["referrer", "certified"] as const).map((t) => (
              <div key={t} className="rounded-2xl border border-line p-5">
                <div className="text-[16px] font-extrabold text-navy-900">{RATES[t].label}</div>
                <div className="mt-3 flex gap-6">
                  <div>
                    <div className="text-2xl font-extrabold text-mint-700">{pct(RATES[t].setup)}</div>
                    <div className="text-[12px] text-mist">מההקמה</div>
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-mint-700">{pct(RATES[t].monthly)}</div>
                    <div className="text-[12px] text-mist">מהמנוי / חודש</div>
                  </div>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
                  {t === "referrer"
                    ? "אתם מפנים, אנחנו מקימים ומתמכים. אפס עבודה מצדכם."
                    : "אתם מקימים ומחברים בעצמכם — עמלה כפולה. דורש הסמכה."}
                </p>
              </div>
            ))}
          </div>
          {err && <p className="mt-4 text-[14px] font-semibold text-accent">{err}</p>}
          <form action={join}>
            <button className="mt-6 w-full rounded-full bg-navy py-3.5 text-[16px] font-bold text-white transition-transform hover:-translate-y-0.5">
              הצטרפות חינם
            </button>
          </form>
        </PlainCard>
      </div>
    );
  }

  // ── Partner portal ──
  const stats = computeStats(referrals);
  const rate = RATES[partner.tier];
  const refLink = `${siteUrl()}/signup?ref=${partner.ref_code}`;

  async function upgrade() {
    "use server";
    const r = await requestCertification();
    if (r) redirect(`/dashboard/partner?err=${encodeURIComponent(r.error)}`);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <MintCard
          title="הכסף שלי"
          subtitle={`מסלול ${rate.label} · ${pct(rate.setup)} הקמה · ${pct(rate.monthly)} מנוי`}
          footer={
            <Link href="#referrals" className="text-[14px] font-bold text-mint-700 hover:underline">
              להפניות שלי ←
            </Link>
          }
        >
          <div className="grid grid-cols-3 items-center gap-4">
            <Stat value={stats.activeClients} label="לקוחות פעילים" />
            <Stat value={stats.lifetime} label="הרווח שלי" hint="מתחילת השותפות" money big />
            <Stat
              value={stats.pendingMonthly}
              label="כסף ממתין"
              hint="נסגר וטרם הפך לפעיל"
              money
            />
          </div>
        </MintCard>

        <Steps
          title="איך זה עובד"
          steps={[
            <>
              שלחו ללקוחות שלכם את <b>לינק ההפניה האישי</b> שלכם, או תנו להם את הקופון.
            </>,
            <>כשהלקוח נרשם ובוחר מסלול — ההפניה נרשמת אליכם אוטומטית ותופיע כאן.</>,
            <>כשהלקוח הופך לפעיל — העמלה החודשית מתחילה להתגלגל אליכם. ובום 💥</>,
          ]}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PlainCard title="לינק ההפניה שלי" subtitle="כל מי שנרשם דרכו נרשם אליכם אוטומטית">
          <CopyField label="" value={refLink} />
        </PlainCard>
        <PlainCard
          title="קופון ההנחה שלי"
          subtitle={`${partner.coupon_percent}% הנחה ללקוח — בלי לגעת בעמלה שלכם`}
        >
          <CopyField label="" value={partner.coupon_code} />
        </PlainCard>
      </div>

      <PlainCard title="הרווח שלי" subtitle="ב-6 החודשים האחרונים">
        <EarningsChart data={earningsByMonth(referrals)} />
      </PlainCard>

      <div id="referrals">
        <PlainCard title="ההפניות שלי" subtitle={`${stats.referrals} סה״כ`}>
          {referrals.length === 0 ? (
            <p className="py-6 text-center text-[14px] text-mist">
              עדיין אין הפניות — שתפו את הלינק שלכם כדי להתחיל.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[14px]">
                <thead>
                  <tr className="text-[12.5px] text-mist">
                    {["לקוח", "סטטוס", "מסלול", "עמלת הקמה", "עמלה חודשית", "תאריך"].map((h) => (
                      <th key={h} className="px-2 py-2 text-right font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((r) => (
                    <tr key={r.id} className="border-t border-line">
                      <td className="px-2 py-3">
                        <div className="font-bold text-navy-900">{r.client_name || "—"}</div>
                        <div className="text-[12px] text-mist" dir="ltr">
                          {r.client_site || ""}
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-[12px] font-bold ${STATUS_PILL[r.status]}`}>
                          {STATUS_LABEL[r.status]}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-ink-soft">{r.plan || "—"}</td>
                      <td className="px-2 py-3 font-semibold">{ILS(Number(r.commission_setup ?? 0))}</td>
                      <td className="px-2 py-3 font-bold text-mint-700">
                        {ILS(Number(r.commission_monthly ?? 0))}
                      </td>
                      <td className="px-2 py-3 text-mist">
                        {new Date(r.created_at).toLocaleDateString("he-IL")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {stats.pendingMonthly > 0 && (
                <p className="mt-4 text-[12.5px] leading-relaxed text-mist">
                  💡 {ILS(stats.pendingMonthly)}/חודש מופיעים בטבלה אך עדיין לא נספרים ב״הרווח שלי״ — הם
                  יתחילו להתגלגל כשהלקוח יהפוך לפעיל (כלומר ישלם בפועל).
                </p>
              )}
            </div>
          )}
        </PlainCard>
      </div>

      {partner.tier === "referrer" ? (
        <PlainCard title="שדרוג לשותף מוסמך" subtitle="עמלה כפולה — 50% מההקמה ו-25% מהמנוי">
          <div className="rounded-2xl bg-shell p-5">
            <div className="text-[14px] font-bold text-navy-900">מה אתם מתחייבים אליו</div>
            <ul className="mt-2 space-y-1.5 text-[14px] text-ink-soft">
              <li>• להתקין עד {partner.install_quota} אתרים בחודש.</li>
              <li>• לעבור הדרכת הסמכה לפני ההתקנה הראשונה.</li>
            </ul>
          </div>
          {err && <p className="mt-3 text-[14px] font-semibold text-accent">{err}</p>}
          {partner.certification_requested_at ? (
            <div className="mt-5 rounded-2xl border border-mint bg-mint/10 px-5 py-4">
              <div className="text-[15px] font-bold text-mint-700">בקשתכם נשלחה ✓</div>
              <p className="mt-1 text-[13.5px] text-ink-soft">
                ניצור קשר לתיאום ההדרכה. עד לאישור, העמלות נשארות במסלול מפנה.
              </p>
            </div>
          ) : (
            <form action={upgrade}>
              <button className="mt-5 rounded-full bg-navy px-7 py-3 text-[15px] font-bold text-white transition-transform hover:-translate-y-0.5">
                שליחת בקשה
              </button>
              <p className="mt-2 text-[12.5px] text-mist">
                הבקשה נשלחת לאישורנו — השדרוג נכנס לתוקף אחרי ההדרכה.
              </p>
            </form>
          )}
        </PlainCard>
      ) : (
        <PlainCard title="אתם שותפים מוסמכים ⭐" subtitle={`מכסת התקנות: ${partner.install_quota} אתרים בחודש`}>
          <p className="text-[14px] text-ink-soft">
            העמלות שלכם: {pct(RATES.certified.setup)} מההקמה ו-{pct(RATES.certified.monthly)} מהמנוי, כל חודש
            שהלקוח פעיל.
          </p>
        </PlainCard>
      )}
    </div>
  );
}
