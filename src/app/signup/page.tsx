"use client";

import Link from "next/link";
import { Suspense, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { signUp, type AuthState } from "@/app/auth/actions";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-mist focus:border-brand focus:ring-2 focus:ring-brand/20";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full rounded-xl bg-brand-700 py-3.5 text-[16px] font-bold text-white shadow-[0_10px_24px_-10px_rgba(0,122,124,0.7)] transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
    >
      {pending ? "רגע…" : "יצירת חשבון"}
    </button>
  );
}

function SignupForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(signUp, {});
  const searchParams = useSearchParams();
  // Partner referral link: /signup?ref=CODE — carried through so the signup is attributed.
  const ref = searchParams.get("ref") ?? "";

  return (
    <form action={formAction}>
      {ref && <input type="hidden" name="ref" value={ref} />}

      <label className="mb-4 block">
        <span className="mb-1.5 block text-[14px] font-semibold text-ink">שם מלא</span>
        <input name="full_name" required autoComplete="name" placeholder="ישראל ישראלי" className={inputClass} />
      </label>

      <label className="mb-4 block">
        <span className="mb-1.5 block text-[14px] font-semibold text-ink">אימייל</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="name@example.com"
          dir="ltr"
          className={inputClass}
        />
      </label>

      <label className="mb-4 block">
        <span className="mb-1.5 block text-[14px] font-semibold text-ink">כתובת האתר</span>
        <input name="site_url" placeholder="example.co.il" dir="ltr" className={inputClass} />
      </label>

      <label className="mb-4 block">
        <span className="mb-1.5 block text-[14px] font-semibold text-ink">סיסמה</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="בחרו סיסמה"
          dir="ltr"
          className={inputClass}
        />
      </label>

      {state.error && (
        <p
          role="alert"
          className="mb-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-2.5 text-[14px] font-semibold text-accent"
        >
          {state.error}
        </p>
      )}

      {state.notice && (
        <p
          role="status"
          className="mb-3 rounded-xl border border-brand/30 bg-brand/5 px-4 py-2.5 text-[14px] font-semibold text-brand-700"
        >
          {state.notice}
        </p>
      )}

      <Submit />
    </form>
  );
}

export default function SignupPage() {
  return (
    <AuthShell
      title="פתיחת חשבון"
      subtitle="מתחילים ב-Wisply — בלי סיכון, בלי כרטיס אשראי."
      footer={
        <>
          כבר יש לכם חשבון?{" "}
          <Link href="/login" className="font-bold text-brand-700 hover:underline">
            כניסה
          </Link>
        </>
      }
    >
      {/* useSearchParams needs a Suspense boundary during prerender. */}
      <Suspense fallback={null}>
        <SignupForm />
      </Suspense>
      <p className="mt-4 text-center text-[12px] text-mist">
        בהרשמה אתם מאשרים את תנאי השימוש ומדיניות הפרטיות.
      </p>
    </AuthShell>
  );
}
