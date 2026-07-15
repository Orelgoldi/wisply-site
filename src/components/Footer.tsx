import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-ink-soft">
            עוזר AI חכם לאתר — עונה, לוכד לידים ומתחבר למערכות שלך. בעברית מלאה.
          </p>
        </div>
        <div>
          <div className="mb-3 text-[13px] font-bold text-mist">מוצר</div>
          <ul className="space-y-2 text-[14px] text-ink-soft">
            <li><a href="#features" className="hover:text-brand-700">יכולות</a></li>
            <li><a href="#pricing" className="hover:text-brand-700">מחירים</a></li>
            <li><a href="#who" className="hover:text-brand-700">למי מתאים</a></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-[13px] font-bold text-mist">חשבון</div>
          <ul className="space-y-2 text-[14px] text-ink-soft">
            <li><a href="/login" className="hover:text-brand-700">כניסה</a></li>
            <li><a href="/signup" className="hover:text-brand-700">הרשמה</a></li>
            <li><a href="/partners" className="hover:text-brand-700">תוכנית שותפים</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-5 text-[13px] text-mist">
          <span>© {new Date().getFullYear()} Wisply. כל הזכויות שמורות.</span>
          <span>נבנה באהבה בישראל 🇮🇱</span>
        </div>
      </div>
    </footer>
  );
}
