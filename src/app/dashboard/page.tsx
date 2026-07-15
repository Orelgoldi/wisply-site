import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ILS } from "@/lib/types";
import type { Profile, Subscription, SubStatus } from "@/lib/types";

const PLAN_LABEL: Record<string, string> = {
  spark: "Spark ✨",
  lite: "Lite",
  business: "Business",
  pro: "Pro",
  enterprise: "Enterprise",
};

const SUB_STATUS: Record<SubStatus, { label: string; pill: string }> = {
  trialing: { label: "בתקופת ניסיון", pill: "bg-amber-50 text-amber-700 ring-amber-200" },
  active: { label: "פעיל", pill: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  past_due: { label: "ממתין לתשלום", pill: "bg-red-50 text-red-700 ring-red-200" },
  canceled: { label: "בוטל", pill: "bg-cloud text-mist ring-line" },
};

/** Turn a stored site_url into something safe to put in href. */
function toHref(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function StatCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-line bg-white p-6 shadow-[var(--shadow-card)]">
      <p className="text-[13px] font-semibold text-mist">{title}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: sub }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle<Subscription>(),
  ]);

  const firstName = profile?.full_name?.trim().split(/\s+/)[0] || "שלום";
  const greeting = profile?.full_name?.trim() ? `שלום, ${firstName} 👋` : "שלום 👋";
  const siteUrl = profile?.site_url?.trim() || null;
  const status = sub ? SUB_STATUS[sub.status] : null;

  return (
    <div className="space-y-8">
      {/* ── welcome ─────────────────────────────────────────────── */}
      <header>
        <h1 className="text-[32px] font-extrabold leading-tight text-ink">{greeting}</h1>
        <p className="mt-1 text-[15px] text-ink-soft">
          {siteUrl ? (
            <>
              הבוט שלך משויך ל־
              <a
                href={toHref(siteUrl)}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-brand-700 hover:underline"
              >
                {siteUrl}
              </a>
            </>
          ) : (
            "זה האזור האישי שלך. כאן תראה את המסלול, הסטטוס והבוט שלך."
          )}
        </p>
      </header>

      {/* ── stats ───────────────────────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard title="המסלול שלי">
          {sub ? (
            <p className="text-[22px] font-extrabold text-ink">
              {PLAN_LABEL[sub.plan] ?? sub.plan}
            </p>
          ) : (
            <p className="text-[15px] font-semibold text-mist">עדיין לא נבחר מסלול</p>
          )}
        </StatCard>

        <StatCard title="סטטוס">
          {status ? (
            <span
              className={`inline-flex rounded-full px-3 py-1 text-[14px] font-bold ring-1 ring-inset ${status.pill}`}
            >
              {status.label}
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-cloud px-3 py-1 text-[14px] font-bold text-mist ring-1 ring-inset ring-line">
              —
            </span>
          )}
        </StatCard>

        <StatCard title="תשלום חודשי">
          <p className="text-[22px] font-extrabold text-ink">
            {sub && sub.monthly_fee !== null ? ILS(sub.monthly_fee) : "—"}
          </p>
        </StatCard>
      </div>

      {/* ── my bot ──────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-line bg-white p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-[18px] font-extrabold text-ink">הבוט שלי</h2>
        {siteUrl ? (
          <>
            <a
              href={toHref(siteUrl)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex rounded-full bg-cloud px-4 py-2 text-[15px] font-bold text-brand-700 ring-1 ring-inset ring-line hover:bg-white"
            >
              {siteUrl}
            </a>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
              עדכוני התקנה וסטטוס הבוט יופיעו כאן. אם משהו נראה לא מעודכן, אפשר לפנות אלינו ונבדוק.
            </p>
          </>
        ) : (
          <div className="mt-3 rounded-2xl border border-dashed border-line bg-cloud p-5">
            <p className="text-[15px] font-semibold text-ink">עוד לא הוספת כתובת אתר</p>
            <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
              ברגע שנדע לאיזה אתר לחבר את הבוט, נוכל להתחיל בהתקנה. עדכוני הסטטוס יופיעו כאן.
            </p>
          </div>
        )}
      </section>

      {/* ── plans ───────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-line bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-extrabold text-ink">בחירת מסלול</h2>
            <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
              {sub
                ? "אפשר לשדרג או להחליף מסלול בכל שלב."
                : "בחר את המסלול שמתאים לך כדי להפעיל את הבוט."}
            </p>
          </div>
          <Link
            href="/dashboard/plans"
            className="rounded-full bg-brand-700 px-5 py-2.5 text-[15px] font-bold text-white hover:bg-brand-900"
          >
            בחירת מסלול / שדרוג
          </Link>
        </div>
      </section>
    </div>
  );
}
