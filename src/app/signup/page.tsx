import Link from "next/link";
import { AuthShell, Field, SubmitButton } from "@/components/AuthShell";

export const metadata = { title: "הרשמה — Wisply" };

export default function SignupPage() {
  return (
    <AuthShell
      title="פתיחת חשבון"
      subtitle="מתחילים ב-Wisply — בלי סיכון, בלי כרטיס אשראי."
      footer={<>כבר יש לכם חשבון? <Link href="/login" className="font-bold text-brand-700 hover:underline">כניסה</Link></>}
    >
      <Field label="שם מלא" placeholder="ישראל ישראלי" />
      <Field label="אימייל" type="email" placeholder="name@example.com" dir="ltr" />
      <Field label="כתובת האתר" placeholder="example.co.il" dir="ltr" />
      <Field label="סיסמה" type="password" placeholder="בחרו סיסמה" dir="ltr" />
      <SubmitButton>יצירת חשבון</SubmitButton>
      <p className="mt-4 text-center text-[12px] text-mist">
        בהרשמה אתם מאשרים את תנאי השימוש ומדיניות הפרטיות.
      </p>
    </AuthShell>
  );
}
