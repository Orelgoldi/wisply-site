import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MintCard, PlainCard, Stat, Steps } from "@/components/dash/Cards";
import type { Profile, Subscription, SubStatus } from "@/lib/types";

const PLAN_LABEL: Record<string, string> = {
  spark: "Spark ✨",
  lite: "Lite",
  business: "Business",
  pro: "Pro",
  enterprise: "Enterprise",
};

const SUB_STATUS: Record<SubStatus, { label: string; pill: string }> = {
  trialing: { label: "בתקופת ניסיון", pill: "bg-gold/20 text-[#8a5a00]" },
  active: { label: "פעיל", pill: "bg-mint/30 text-mint-700" },
  past_due: { label: "ממתין לתשלום", pill: "bg-accent/10 text-accent-600" },
  canceled: { label: "בוטל", pill: "bg-shell text-mist" },
};

/** Turn a stored site_url into something safe to put in href. */
function toHref(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: sub }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>(),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle<Subscription>(),
  ]);

  const first = (profile?.full_name || user.email || "").split(" ")[0];
  const status = sub ? SUB_STATUS[sub.status] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[30px] font-extrabold text-navy-900">שלום, {first} 👋</h1>
        <p className="mt-1 text-[15px] text-ink-soft">
          {profile?.site_url ? (
            <>
              הבוט שלך משויך ל־<span dir="ltr" className="font-semibold">{profile.site_url}</span>
            </>
          ) : (
            "כאן תנהלו את הבוט, המסלול והחשבון שלכם."
          )}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <MintCard
          title="המנוי שלי"
          subtitle={sub ? "פרטי המסלול הנוכחי" : "עדיין לא נבחר מסלול"}
          footer={
            <Link href="/dashboard/plans" className="text-[14px] font-bold text-mint-700 hover:underline">
              {sub ? "שינוי או שדרוג מסלול ←" : "לבחירת מסלול ←"}
            </Link>
          }
        >
          {sub && status ? (
            <div className="grid grid-cols-3 items-center gap-4">
              <div className="text-center">
                <div className="text-[30px] font-extrabold leading-none text-navy-900">
                  {PLAN_LABEL[sub.plan] ?? sub.plan}
                </div>
                <div className="mt-2 text-[14px] font-semibold text-ink-soft">המסלול שלי</div>
              </div>
              <Stat value={Number(sub.monthly_fee ?? 0)} label="תשלום חודשי" hint="כולל מע״מ" money big />
              <div className="text-center">
                <span className={`inline-block rounded-full px-3 py-1.5 text-[13px] font-bold ${status.pill}`}>
                  {status.label}
                </span>
                <div className="mt-2 text-[14px] font-semibold text-ink-soft">סטטוס</div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-[15px] text-ink-soft">עדיין לא בחרתם מסלול.</p>
              <Link
                href="/dashboard/plans"
                className="mt-4 inline-block rounded-full bg-navy px-6 py-2.5 text-[15px] font-bold text-white"
              >
                בחירת מסלול
              </Link>
            </div>
          )}
        </MintCard>

        <Steps
          title="איך מתחילים"
          steps={[
            <>
              בוחרים מסלול שמתאים לכם — אפשר להתחיל מ-<b>Spark</b> ולשלם רק לפי שיחות.
            </>,
            <>אנחנו מקימים ומחברים את הבוט לאתר שלכם ולמערכות שלכם.</>,
            <>הבוט מתחיל לענות ללקוחות וללכוד לידים — 24/7. 🚀</>,
          ]}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PlainCard title="הבוט שלי" subtitle="סטטוס ההטמעה">
          {profile?.site_url ? (
            <>
              <a
                href={toHref(profile.site_url)}
                target="_blank"
                rel="noreferrer"
                dir="ltr"
                className="text-[16px] font-bold text-navy-900 hover:text-mint-700"
              >
                {profile.site_url}
              </a>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
                עדכוני התקנה וסטטוס הבוט יופיעו כאן. אם משהו נראה לא מעודכן — פנו אלינו ונבדוק.
              </p>
            </>
          ) : (
            <p className="text-[14px] text-ink-soft">
              עדיין לא הוגדרה כתובת אתר. פנו אלינו ונשלים את ההגדרה.
            </p>
          )}
        </PlainCard>

        <PlainCard title="רוצים להרוויח מ-Wisply?" subtitle="לבוני אתרים וסוכנויות">
          <p className="text-[14px] leading-relaxed text-ink-soft">
            הפנו לקוחות וקבלו עמלה חד-פעמית על ההקמה + עמלה שמתגלגלת כל חודש, כל עוד הלקוח פעיל.
          </p>
          <Link
            href="/dashboard/partner"
            className="mt-4 inline-block rounded-full bg-navy px-6 py-2.5 text-[15px] font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            לתוכנית השותפים
          </Link>
        </PlainCard>
      </div>
    </div>
  );
}
