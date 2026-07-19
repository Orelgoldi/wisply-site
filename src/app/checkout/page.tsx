"use client";

import Link from "next/link";
import { Suspense, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { startCheckout, type CheckoutState } from "./actions";
import { PLAN_FEE, ILS } from "@/lib/types";

const PLAN_LABEL: Record<string, string> = {
  lite: "Lite",
  business: "Business",
  pro: "Pro",
};

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-mist focus:border-brand focus:ring-2 focus:ring-brand/20";

function Submit({ amount }: { amount: number }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full rounded-xl bg-accent py-3.5 text-[16px] font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,122,89,0.7)] transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
    >
      {pending ? "מעבירים לתשלום…" : `לתשלום מאובטח · ${ILS(amount)} לחודש`}
    </button>
  );
}

function CheckoutForm() {
  const [state, formAction] = useActionState<CheckoutState, FormData>(startCheckout, {});
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") ?? "";
  const ref = searchParams.get("ref") ?? "";
  const amount = PLAN_FEE[plan];

  // Unknown or non-purchasable plan → send them to pick one.
  if (amount === undefined || amount <= 0 || plan === "enterprise") {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-line bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <h1 className="text-xl font-extrabold text-ink">בחרו מסלול כדי להמשיך</h1>
        <p className="mt-2 text-[14px] text-ink-soft">המסלול שביקשתם לא זמין לרכישה ישירה.</p>
        <Link
          href="/#pricing"
          className="mt-5 inline-block rounded-full bg-brand-700 px-6 py-2.5 text-[15px] font-bold text-white"
        >
          למסלולים
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_380px]">
      {/* Registration */}
      <div className="order-2 rounded-3xl border border-line bg-white p-7 shadow-[var(--shadow-card)] lg:order-1">
        <h1 className="text-2xl font-extrabold text-ink">פרטי החשבון</h1>
        <p className="mt-1.5 text-[14px] text-ink-soft">
          יוצרים את החשבון, ומיד אחריו עוברים לתשלום מאובטח.
        </p>

        <form action={formAction} className="mt-6">
          <input type="hidden" name="plan" value={plan} />
          {ref && <input type="hidden" name="ref" value={ref} />}

          <label className="mb-4 block">
            <span className="mb-1.5 block text-[14px] font-semibold text-ink">שם מלא</span>
            <input name="full_name" required autoComplete="name" placeholder="ישראל ישראלי" className={inputClass} />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="mb-4 block">
              <span className="mb-1.5 block text-[14px] font-semibold text-ink">אימייל</span>
              <input name="email" type="email" required autoComplete="email" placeholder="name@example.com" dir="ltr" className={inputClass} />
            </label>
            <label className="mb-4 block">
              <span className="mb-1.5 block text-[14px] font-semibold text-ink">טלפון</span>
              <input name="phone" type="tel" autoComplete="tel" placeholder="050-0000000" dir="ltr" className={inputClass} />
            </label>
          </div>

          <label className="mb-4 block">
            <span className="mb-1.5 block text-[14px] font-semibold text-ink">כתובת האתר</span>
            <input name="site_url" placeholder="example.co.il" dir="ltr" className={inputClass} />
          </label>

          <label className="mb-4 block">
            <span className="mb-1.5 block text-[14px] font-semibold text-ink">בחרו סיסמה</span>
            <input name="password" type="password" required minLength={6} autoComplete="new-password" placeholder="לפחות 6 תווים" dir="ltr" className={inputClass} />
          </label>

          {state.error && (
            <p role="alert" className="mb-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-2.5 text-[14px] font-semibold text-accent">
              {state.error}
            </p>
          )}

          <Submit amount={amount} />

          <p className="mt-4 text-center text-[12px] text-mist">
            כבר יש לכם חשבון?{" "}
            <Link href="/login" className="font-bold text-brand-700 hover:underline">
              התחברו וקנו מאזור המסלולים
            </Link>
          </p>
        </form>
      </div>

      {/* Order summary */}
      <aside className="order-1 h-fit rounded-3xl bg-navy p-7 text-white lg:order-2">
        <div className="text-[13px] font-bold text-mint">סיכום הזמנה</div>
        <div className="mt-4 flex items-baseline justify-between border-b border-white/15 pb-4">
          <div className="text-[19px] font-extrabold">מסלול {PLAN_LABEL[plan] ?? plan}</div>
          <div className="text-[15px] text-white/70">חודשי</div>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <div className="text-[15px] text-white/80">לתשלום היום</div>
          <div className="text-[30px] font-extrabold text-mint">{ILS(amount)}</div>
        </div>
        <div className="mt-1 text-left text-[12px] text-white/50">כולל מע״מ · חשבונית מס אוטומטית</div>

        <ul className="mt-6 space-y-2.5 text-[13.5px] text-white/85">
          <li className="flex items-center gap-2"><Dot /> חשבונית מס נשלחת מיד למייל</li>
          <li className="flex items-center gap-2"><Dot /> מפתח רישיון והפעלה תוך רגע</li>
          <li className="flex items-center gap-2"><Dot /> ביטול בכל עת</li>
        </ul>
      </aside>
    </div>
  );
}

function Dot() {
  return <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-mint text-[10px] font-bold text-navy">✓</span>;
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-shell px-5 py-16" dir="rtl">
      <div className="mx-auto mb-8 max-w-4xl text-center">
        <Link href="/" className="text-[22px] font-extrabold text-ink">
          Wisply
        </Link>
      </div>
      <Suspense fallback={null}>
        <CheckoutForm />
      </Suspense>
    </main>
  );
}
