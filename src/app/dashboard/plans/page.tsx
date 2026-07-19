import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Subscription } from "@/lib/types";
import { selectPlan } from "./actions";
import { CheckoutButton } from "./CheckoutButton";

type Plan = {
  id: string;
  name: string;
  tag: string;
  price: string;
  per: string;
  note?: string;
  points: string[];
  accent?: boolean;
  /** Fixed monthly plans go through card checkout; spark/enterprise don't. */
  paid?: boolean;
};

/** Mirrors the marketing pricing exactly (src/components/Pricing.tsx). */
const PLANS: Plan[] = [
  {
    id: "spark",
    name: "Wisply Spark ✨",
    tag: "ללא סיכון",
    price: "₪1",
    per: " / שיחה",
    note: "₪0 דמי מנוי קבועים",
    points: ["משלמים רק כשמדברים", "אין שיחות, אין תשלום", "עברית", "לכידת לידים"],
  },
  {
    id: "lite",
    name: "Lite",
    tag: "לעסק קטן",
    price: "₪99",
    per: "/חודש",
    points: ["500 שיחות", "עברית", "לכידת לידים", "חיבור 1"],
    paid: true,
  },
  {
    id: "business",
    name: "Business",
    tag: "הכי נפוץ",
    price: "₪249",
    per: "/חודש",
    points: ["2,000 שיחות", "100 דק׳ קול", "3 שפות", "2 חיבורים"],
    accent: true,
    paid: true,
  },
  {
    id: "pro",
    name: "Pro",
    tag: "נפח גבוה",
    price: "₪549",
    per: "/חודש",
    points: ["5,000 שיחות", "300 דק׳ קול", "חיבורים ללא הגבלה", "דוחות מלאים"],
    paid: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tag: "ארגונים",
    price: "מ-₪990",
    per: "/חודש",
    points: ["ללא הגבלה", "קול Real-Time", "AI פרימיום", "SLA"],
  },
];

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<Subscription>();

  const currentPlan = subscription?.plan ?? null;

  return (
    <div>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">המסלולים שלנו</h1>
        <p className="mt-3 text-[15px] text-ink-soft">
          אפשר לעבור מסלול בכל שלב. כל המחירים כוללים מע״מ.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-3xl border border-accent/40 bg-accent/10 px-5 py-4 text-[14px] font-semibold text-ink"
        >
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((p) => {
          const isCurrent = p.id === currentPlan;

          async function choose() {
            "use server";
            const res = await selectPlan(p.id);
            if (res.error) {
              redirect(`/dashboard/plans?error=${encodeURIComponent(res.error)}`);
            }
          }

          return (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-3xl border bg-white p-6 ${
                isCurrent
                  ? "border-2 border-brand-700 shadow-[var(--shadow-soft)]"
                  : p.accent
                    ? "border-2 border-brand shadow-[var(--shadow-soft)]"
                    : "border-line shadow-[var(--shadow-card)]"
              }`}
            >
              {isCurrent ? (
                <div className="absolute -top-3 right-6 rounded-full bg-brand-700 px-3 py-1 text-[11px] font-bold text-white">
                  המסלול הנוכחי שלכם
                </div>
              ) : (
                p.accent && (
                  <div className="absolute -top-3 right-6 rounded-full bg-brand px-3 py-1 text-[11px] font-bold text-white">
                    מומלץ
                  </div>
                )
              )}

              <div className="text-[15px] font-bold text-brand-700">{p.name}</div>
              <div className="mt-1 text-[13px] text-mist">{p.tag}</div>

              <div className="mt-3 text-3xl font-extrabold text-ink">
                {p.price}
                <span className="text-sm font-medium text-mist">{p.per}</span>
              </div>
              {p.note && <div className="mt-1 text-[13px] text-mist">{p.note}</div>}

              <ul className="mt-5 space-y-2.5 text-[14px] text-ink-soft">
                {p.points.map((pt) => (
                  <li key={pt} className="flex items-center gap-2">
                    <span className="text-brand">✓</span> {pt}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex-1" />

              {isCurrent ? (
                <button
                  type="button"
                  disabled
                  className="w-full cursor-default rounded-full bg-cloud py-2.5 text-center text-[15px] font-bold text-mist"
                >
                  המסלול הנוכחי שלכם
                </button>
              ) : p.paid ? (
                // Fixed monthly plans → card checkout via Invoice4U.
                <CheckoutButton plan={p.id} accent={p.accent} />
              ) : p.id === "enterprise" ? (
                // Custom quote — a contact link, NOT a plan-granting action. Routing
                // it through select_plan would have handed out a free licence.
                <a
                  href="mailto:hello@wisply.io?subject=Wisply Enterprise"
                  className="block w-full rounded-full bg-brand-700 py-2.5 text-center text-[15px] font-bold text-white transition-transform hover:-translate-y-0.5"
                >
                  דברו איתנו
                </a>
              ) : (
                // Spark — pay-per-conversation, the one genuinely free-to-select tier.
                <form action={choose}>
                  <button
                    type="submit"
                    className={`w-full rounded-full py-2.5 text-center text-[15px] font-bold transition-transform hover:-translate-y-0.5 ${
                      p.accent ? "bg-accent text-white" : "bg-brand-700 text-white"
                    }`}
                  >
                    בחירת מסלול
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-3xl border border-line bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="text-[15px] font-bold text-ink">💳 תשלום</div>
        <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-ink-soft">
          התשלום מתבצע בדף סליקה מאובטח, וחשבונית מס נשלחת אוטומטית למייל. מסלול Spark נגבה לפי
          שיחות, ו-Enterprise מותאם אישית — לשניהם נחזור אליכם להשלמה.
        </p>
      </div>
    </div>
  );
}
