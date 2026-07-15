import Link from "next/link";
import { AuthShell, Field, SubmitButton } from "@/components/AuthShell";

export const metadata = { title: "כניסה — Wisply" };

export default function LoginPage() {
  return (
    <AuthShell
      title="כניסה לחשבון"
      subtitle="שמחים לראות אתכם שוב 👋"
      footer={<>אין לכם חשבון? <Link href="/signup" className="font-bold text-brand-700 hover:underline">להרשמה</Link></>}
    >
      <Field label="אימייל" type="email" placeholder="name@example.com" dir="ltr" />
      <Field label="סיסמה" type="password" placeholder="••••••••" dir="ltr" />
      <div className="mb-2 text-left">
        <Link href="/forgot" className="text-[13px] text-mist hover:text-brand-700">שכחתם סיסמה?</Link>
      </div>
      <SubmitButton>כניסה</SubmitButton>
    </AuthShell>
  );
}
