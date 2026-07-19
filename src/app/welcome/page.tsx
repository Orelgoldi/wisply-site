import Link from "next/link";

/**
 * Where Invoice4U returns the customer after payment. With email confirmation on,
 * they have no session yet — so this page thanks them and points at the confirm
 * email, rather than a dashboard they can't reach until they confirm.
 */
export default function WelcomePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-shell px-5 py-16" dir="rtl">
      <div className="w-full max-w-lg rounded-3xl border border-line bg-white p-9 text-center shadow-[var(--shadow-card)]">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mint text-[30px]">
          ✓
        </div>
        <h1 className="mt-5 text-[26px] font-extrabold text-ink">התשלום התקבל, תודה!</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          חשבונית המס נשלחה למייל שלכם, והחשבון מוכן. שלחנו לכם גם מייל אימות —
          <b className="text-ink"> אשרו אותו כדי להיכנס לדשבורד בפעם הראשונה.</b>
        </p>

        <div className="mt-7 rounded-2xl bg-cloud p-5 text-right">
          <div className="text-[14px] font-bold text-ink">מה עכשיו?</div>
          <ol className="mt-2 space-y-2 text-[13.5px] text-ink-soft">
            <li>1. פתחו את מייל האימות מ-Wisply ולחצו על הקישור.</li>
            <li>2. תועברו לדשבורד — שם יחכה לכם מפתח הרישיון.</li>
            <li>3. מדביקים אותו בתוסף בוורדפרס, וזה עובד.</li>
          </ol>
        </div>

        <Link
          href="/login"
          className="mt-7 inline-block rounded-full bg-brand-700 px-8 py-3 text-[15px] font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          למסך הכניסה
        </Link>
        <p className="mt-4 text-[12.5px] text-mist">
          לא קיבלתם מייל? בדקו בספאם, או פנו אלינו ל-hello@wisply.io
        </p>
      </div>
    </main>
  );
}
