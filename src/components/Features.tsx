"use client";

import { motion } from "motion/react";
import { Reveal } from "./Reveal";
import type { ReactNode } from "react";

type Feature = { icon: ReactNode; title: string; desc: string; badge?: string };

const features: Feature[] = [
  {
    icon: <IconBrain />,
    title: "עונה מתוך תוכן האתר",
    desc: "הבוט לומד את האתר שלך ועונה רק לפי המידע האמיתי — בלי להמציא. תשובות מדויקות בשפה טבעית.",
  },
  {
    icon: <IconMic />,
    title: "מדבר ומקשיב בקול",
    desc: "הקראה קולית של התשובות ושיחות קול דו-כיווניות — כולל מצב Real-Time של דיבור רציף ללא השהיה.",
    badge: "קול",
  },
  {
    icon: <IconLead />,
    title: "לוכד לידים אוטומטית",
    desc: "מזהה עניין, מבקש פרטים עם הסכמה שיווקית תקנית, ושומר כל ליד עם סיכום השיחה המלא.",
  },
  {
    icon: <IconPlug />,
    title: "מתחבר ל-CRM ולדיוור",
    desc: "כל ליד נשלח ישירות ל-CRM, לרשימת דיוור (Brevo/Mailchimp) או לכל מערכת דרך Webhook.",
  },
  {
    icon: <IconGlobe />,
    title: "עברית, אנגלית ורוסית",
    desc: "זיהוי שפה אוטומטי ומענה בשפת הגולש — עברית מלאה עם תמיכת RTL, ועוד שתי שפות מובנות.",
  },
  {
    icon: <IconBell />,
    title: "יוזם פנייה בעצמו",
    desc: "בועית פנייה חכמה שקופצת ברגע הנכון, ופתיחה אוטומטית בדסקטופ — מזמינה את הגולש לדבר.",
  },
  {
    icon: <IconChart />,
    title: "דוחות וסיווג חכם",
    desc: "מסווג פניות שיווקיות מול חיפושי עבודה, ושולח דוח יומי ושבועי עם קובץ Excel ישר למייל.",
  },
  {
    icon: <IconRocket />,
    title: "מוקם ומנוהל עבורך",
    desc: "אנחנו מתקינים, מאמנים, מעצבים ומחברים. אתם רק מקבלים לידים — Done-for-you.",
    badge: "שירות מלא",
  },
  {
    icon: <IconWordpress />,
    title: "מותאם לוורדפרס",
    desc: "מותקן כתוסף וורדפרס, עם עדכונים אוטומטיים מתוך מסך הניהול. תמיכה בפלטפורמות נוספות בהמשך.",
    badge: "WordPress",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="mb-3 text-[15px] font-bold text-brand-700">היכולות</div>
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
            כל מה שצריך כדי להפוך גולשים ללקוחות
          </h2>
          <p className="mt-5 text-lg text-ink-soft">
            מנוע אחד — ומאחוריו כל הכלים: מענה חכם, קול, לכידת לידים ואינטגרציות.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: (i % 4) * 0.08 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-[var(--shadow-card)]"
            >
              <div className="brand-gradient mb-5 grid h-12 w-12 place-items-center rounded-2xl text-white shadow-[0_10px_24px_-10px_rgba(0,122,124,0.7)]">
                {f.icon}
              </div>
              {f.badge && (
                <span className="absolute left-5 top-6 rounded-full bg-cloud px-2.5 py-1 text-[11px] font-bold text-brand-700">
                  {f.badge}
                </span>
              )}
              <h3 className="text-[18px] font-bold text-ink">{f.title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">{f.desc}</p>
              <div className="brand-gradient absolute inset-x-0 bottom-0 h-1 origin-right scale-x-0 transition-transform duration-500 group-hover:scale-x-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- icons ---- */
const s = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
function IconBrain() { return <svg width="22" height="22" viewBox="0 0 24 24" {...s}><path d="M12 5a3 3 0 0 0-6 0 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 0Zm0 0a3 3 0 0 1 6 0 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 0" /></svg>; }
function IconMic() { return <svg width="22" height="22" viewBox="0 0 24 24" {...s}><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>; }
function IconLead() { return <svg width="22" height="22" viewBox="0 0 24 24" {...s}><path d="M20 8v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7Z" /><path d="M9 12h6M9 16h4M14 3v4h4" /></svg>; }
function IconPlug() { return <svg width="22" height="22" viewBox="0 0 24 24" {...s}><path d="M9 2v6M15 2v6M7 8h10v3a5 5 0 0 1-10 0V8ZM12 16v6" /></svg>; }
function IconGlobe() { return <svg width="22" height="22" viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" /></svg>; }
function IconBell() { return <svg width="22" height="22" viewBox="0 0 24 24" {...s}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M10.5 21a2 2 0 0 0 3 0" /></svg>; }
function IconChart() { return <svg width="22" height="22" viewBox="0 0 24 24" {...s}><path d="M3 3v18h18M8 14v4M13 10v8M18 6v12" /></svg>; }
function IconRocket() { return <svg width="22" height="22" viewBox="0 0 24 24" {...s}><path d="M5 13c-1.5 1.5-2 5-2 5s3.5-.5 5-2M12 15l-3-3a10 10 0 0 1 8-9c1 3 0 6-3 9ZM15 9a1 1 0 1 0 0-.01" /></svg>; }
function IconWordpress() { return <svg width="22" height="22" viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9.5" /><path d="M3.2 9.5 8 20.5M9.5 8.3 13.2 20 15.7 12M8 8.2h3M14 8.2h2.5c1.4 0 1.9 2 1 3.8L15.7 12" /></svg>; }
