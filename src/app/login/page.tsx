"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthShell } from "@/components/AuthShell";
import { signIn, type AuthState } from "@/app/auth/actions";

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
      {pending ? "רגע…" : "כניסה"}
    </button>
  );
}

function LoginForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(signIn, {});
  const searchParams = useSearchParams();
  // /auth/callback bounces here with ?error=1 when the confirmation link fails.
  const linkError = searchParams.get("error");
  const error = state.error ?? (linkError ? "הקישור לא תקין או שפג תוקפו. נסו להיכנס שוב." : null);

  return (
    <form action={formAction}>
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
        <span className="mb-1.5 block text-[14px] font-semibold text-ink">סיסמה</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          dir="ltr"
          className={inputClass}
        />
      </label>

      <div className="mb-2 text-left">
        <Link href="/forgot" className="text-[13px] text-mist hover:text-brand-700">
          שכחתם סיסמה?
        </Link>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-2.5 text-[14px] font-semibold text-accent"
        >
          {error}
        </p>
      )}

      <Submit />
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      title="כניסה לחשבון"
      subtitle="שמחים לראות אתכם שוב 👋"
      footer={
        <>
          אין לכם חשבון?{" "}
          <Link href="/signup" className="font-bold text-brand-700 hover:underline">
            להרשמה
          </Link>
        </>
      }
    >
      {/* useSearchParams needs a Suspense boundary during prerender. */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
