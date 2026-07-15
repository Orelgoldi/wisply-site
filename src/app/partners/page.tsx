import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Wisply — תוכנית שותפים לבוני אתרים",
  description:
    "הרוויחו עמלה חד-פעמית + הכנסה חוזרת מכל לקוח. לינק הפניה קבוע, קופון הנחה, ומעקב בזמן אמת.",
};

const steps = [
  { n: "1", t: "נרשמים חינם", d: "פותחים חשבון שותף ומקבלים לינק הפניה קבוע וקופון אישי." },
  { n: "2", t: "מפנים לקוחות", d: "משתפים את הלינק/הקופון, או מתקינים בעצמכם כשותף מוסמך." },
  { n: "3", t: "מרוויחים כל חודש", d: "עמלה על ההקמה + סכום שמתגלגל כל חודש שהלקוח פעיל." },
];

const setupRows = [
  ["Basic", "₪1,290", "₪322", "₪645"],
  ["Plus", "₪2,490", "₪622", "₪1,245"],
  ["Tailor-Made", "₪3,900", "₪975", "₪1,950"],
];
const monthlyRows = [
  ["Lite", "₪99", "₪15", "₪25"],
  ["Business", "₪249", "₪37", "₪62"],
  ["Pro", "₪549", "₪82", "₪137"],
  ["Enterprise", "₪990", "₪149", "₪248"],
];

export default function PartnersPage() {
  return (
    <>
      <Nav />
      <main className="pt-32">
        {/* hero */}
        <section className="relative overflow-hidden pb-16">
          <div className="blob brand-gradient" style={{ width: 440, height: 440, top: -180, left: -120 }} />
          <div className="relative z-10 mx-auto max-w-4xl px-5 text-center">
            <Reveal>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3.5 py-1.5 text-[13px] font-semibold text-brand-700 backdrop-blur">
                🤝 לבוני אתרים, פרילנסרים וסוכנויות
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-6xl">
                הפכו כל לקוח ל<span className="grad-text">הכנסה חוזרת</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft">
                הוסיפו את Wisply לשירותים שלכם. אתם מפנים או מקימים — ומקבלים עמלה חד-פעמית
                על ההקמה, ועמלה שמתגלגלת כל חודש. עם אזור אישי לניהול ההפניות.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-4">
                <a href="/signup?role=partner" className="rounded-full bg-accent px-7 py-3.5 text-[16px] font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,122,89,0.7)] transition-transform hover:-translate-y-0.5">
                  הצטרפות חינם
                </a>
                <a href="/#pricing" className="rounded-full border border-line bg-white px-7 py-3.5 text-[16px] font-bold text-ink transition-colors hover:border-brand hover:text-brand-700">
                  למסלולי המחיר
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* steps */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-5">
            <div className="grid gap-5 md:grid-cols-3">
              {steps.map((s) => (
                <Reveal key={s.n} className="rounded-3xl border border-line bg-white p-7 shadow-[var(--shadow-card)]">
                  <div className="brand-gradient grid h-11 w-11 place-items-center rounded-2xl text-lg font-extrabold text-white">{s.n}</div>
                  <h3 className="mt-4 text-[19px] font-bold text-ink">{s.t}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">{s.d}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* two tracks */}
        <section className="py-10">
          <div className="mx-auto max-w-5xl px-5">
            <Reveal className="mb-10 text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">שני מסלולי שותפות</h2>
              <p className="mt-3 text-ink-soft">לפי כמה שאתם רוצים להיות מעורבים.</p>
            </Reveal>
            <div className="grid gap-5 md:grid-cols-2">
              <Reveal className="rounded-3xl border border-line bg-white p-8 shadow-[var(--shadow-card)]">
                <h3 className="text-xl font-extrabold text-ink">מפנה</h3>
                <p className="mt-1 text-[14px] text-mist">אתם מפנים, אנחנו מקימים ומתמכים</p>
                <div className="mt-5 flex gap-6">
                  <div><div className="text-3xl font-extrabold grad-text">25%</div><div className="text-[13px] text-mist">מההקמה</div></div>
                  <div><div className="text-3xl font-extrabold grad-text">15%</div><div className="text-[13px] text-mist">מהמנוי / חודש</div></div>
                </div>
                <ul className="mt-5 space-y-2 text-[14px] text-ink-soft">
                  <li>✓ אפס עבודה מצדכם</li>
                  <li>✓ עמלה חוזרת לכל אורך חיי הלקוח</li>
                </ul>
              </Reveal>
              <Reveal delay={0.08} className="relative rounded-3xl border-2 border-brand bg-white p-8 shadow-[var(--shadow-soft)]">
                <div className="absolute -top-3 right-8 rounded-full bg-brand-700 px-3 py-1 text-[11px] font-bold text-white">הכי משתלם</div>
                <h3 className="text-xl font-extrabold text-ink">שותף מוסמך</h3>
                <p className="mt-1 text-[14px] text-mist">אתם מקימים ומחברים, אנחנו נותנים מוצר + גב</p>
                <div className="mt-5 flex gap-6">
                  <div><div className="text-3xl font-extrabold grad-text">50%</div><div className="text-[13px] text-mist">מההקמה</div></div>
                  <div><div className="text-3xl font-extrabold grad-text">25%</div><div className="text-[13px] text-mist">מהמנוי / חודש</div></div>
                </div>
                <ul className="mt-5 space-y-2 text-[14px] text-ink-soft">
                  <li>✓ עמלה כפולה על ההקמה</li>
                  <li>✓ הדרכת הסמכה + תמיכת גב</li>
                  <li>✓ תנאי: התקנת עד 2 אתרים בחודש</li>
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        {/* commission tables */}
        <section className="py-16">
          <div className="mx-auto grid max-w-5xl gap-5 px-5 md:grid-cols-2">
            <Reveal className="rounded-3xl border border-line bg-white p-6 shadow-[var(--shadow-card)]">
              <h3 className="mb-3 font-bold text-brand-700">עמלת הקמה (חד-פעמי)</h3>
              <table className="w-full text-[14px]">
                <thead><tr className="text-mist"><th className="py-2 text-right font-semibold">חבילה</th><th className="text-center font-semibold">מחיר</th><th className="text-center font-semibold">מפנה</th><th className="text-center font-semibold">מוסמך</th></tr></thead>
                <tbody>
                  {setupRows.map((r) => (
                    <tr key={r[0]} className="border-t border-line">
                      <td className="py-2.5 font-semibold text-ink">{r[0]}</td>
                      <td className="text-center text-ink-soft">{r[1]}</td>
                      <td className="text-center font-bold text-brand-700">{r[2]}</td>
                      <td className="text-center font-bold text-brand-700">{r[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
            <Reveal delay={0.08} className="rounded-3xl border border-line bg-white p-6 shadow-[var(--shadow-card)]">
              <h3 className="mb-3 font-bold text-brand-700">עמלה חודשית מתגלגלת</h3>
              <table className="w-full text-[14px]">
                <thead><tr className="text-mist"><th className="py-2 text-right font-semibold">מנוי</th><th className="text-center font-semibold">מחיר</th><th className="text-center font-semibold">מפנה</th><th className="text-center font-semibold">מוסמך</th></tr></thead>
                <tbody>
                  {monthlyRows.map((r) => (
                    <tr key={r[0]} className="border-t border-line">
                      <td className="py-2.5 font-semibold text-ink">{r[0]}</td>
                      <td className="text-center text-ink-soft">{r[1]}</td>
                      <td className="text-center font-bold text-brand-700">{r[2]}</td>
                      <td className="text-center font-bold text-brand-700">{r[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
          </div>
        </section>

        {/* earning highlight */}
        <section className="pb-24">
          <div className="mx-auto max-w-4xl px-5">
            <Reveal className="overflow-hidden rounded-[32px] bg-brand-900 p-10 text-center text-white sm:p-14">
              <h2 className="text-2xl font-extrabold sm:text-4xl">10 לקוחות = הכנסה פסיבית קבועה</h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/[0.07] p-6 ring-1 ring-white/10">
                  <div className="text-[15px] font-bold text-white/70">כמפנה</div>
                  <div className="mt-2 text-3xl font-extrabold">₪4,440<span className="text-base font-medium text-white/60"> /שנה</span></div>
                  <div className="text-[13px] text-white/60">+ ₪6,220 עמלות הקמה</div>
                </div>
                <div className="rounded-2xl bg-white/[0.07] p-6 ring-1 ring-white/10">
                  <div className="text-[15px] font-bold text-white/70">כשותף מוסמך</div>
                  <div className="mt-2 text-3xl font-extrabold">₪7,440<span className="text-base font-medium text-white/60"> /שנה</span></div>
                  <div className="text-[13px] text-white/60">+ ₪12,450 עמלות הקמה</div>
                </div>
              </div>
              <a href="/signup?role=partner" className="mt-9 inline-block rounded-full bg-accent px-8 py-3.5 text-[16px] font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,122,89,0.6)] transition-transform hover:-translate-y-0.5">
                להצטרפות כשותף →
              </a>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
