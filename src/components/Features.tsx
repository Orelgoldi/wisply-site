"use client";

import { motion } from "motion/react";
import { Reveal } from "./Reveal";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

type Feature = { icon: ReactNode; title: string; desc: string; badge?: string };

/* The thesis lives in its own tile (below). These eight are the supporting cast. */
const features: Feature[] = [
  {
    icon: <IconMic />,
    title: "מדבר ומקשיב בקול",
    desc: "הקראה קולית ושיחות קול דו-כיווניות, כולל מצב Real-Time של דיבור רציף ללא השהיה.",
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
    desc: "זיהוי שפה אוטומטי ומענה בשפת הגולש — עברית מלאה עם RTL, ועוד שתי שפות מובנות.",
  },
  {
    icon: <IconBell />,
    title: "יוזם פנייה בעצמו",
    desc: "בועית פנייה חכמה שקופצת ברגע הנכון, ופתיחה אוטומטית בדסקטופ — מזמינה את הגולש לדבר.",
  },
  {
    icon: <IconChart />,
    title: "דוחות וסיווג חכם",
    desc: "מסווג פניות שיווקיות מול חיפושי עבודה, ושולח דוח יומי ושבועי עם קובץ Excel למייל.",
  },
  {
    icon: <IconWordpress />,
    title: "מותאם לוורדפרס",
    desc: "מותקן כתוסף, עם עדכונים אוטומטיים מתוך מסך הניהול. תמיכה בפלטפורמות נוספות בהמשך.",
    badge: "WordPress",
  },
  {
    icon: <IconRocket />,
    title: "מוקם ומנוהל עבורך",
    desc: "אנחנו מתקינים, מאמנים, מעצבים ומחברים. אתם רק מקבלים לידים — Done-for-you.",
    badge: "שירות מלא",
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
        </Reveal>

        {/* Bento: the thesis tile (2×2) + eight supporting tiles fill a 4×3 grid with
            no orphan. auto-rows-fr keeps every cell the same height. */}
        <div className="mt-14 grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureThesis />
          {features.map((f, i) => (
            <FeatureCard key={f.title} f={f} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** The signature tile: the one claim Wisply is remembered by — it answers only from
 *  your own content and never invents. Spans 2×2 on desktop; carries the boldness so
 *  the supporting cards can stay quiet. */
function FeatureThesis() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: EASE }}
      className="brand-gradient relative flex flex-col justify-between overflow-hidden rounded-[28px] p-7 text-white sm:col-span-2 sm:row-span-2 sm:min-h-[22rem]"
    >
      <div className="relative z-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[12.5px] font-bold backdrop-blur">
          <IconBrain />
          הליבה
        </div>
        <h3 className="text-[26px] font-extrabold leading-tight sm:text-[30px]">
          עונה מתוך תוכן האתר.
          <br />
          אף פעם לא ממציא.
        </h3>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/85">
          הבוט לומד את האתר שלך ועונה רק לפי המידע האמיתי שכתוב בו. כשאין תשובה — הוא אומר,
          ולא מנחש. זה ההבדל בין עוזר אמין לצ׳אטבוט גנרי.
        </p>
      </div>

      {/* Signature moment: an answer that cites where it came from — the product's whole
          promise, shown rather than told. */}
      <div className="relative z-10 mt-6 max-w-sm rounded-2xl bg-white/12 p-4 backdrop-blur">
        <p className="text-[14px] font-semibold leading-snug">
          כן, יש חניה חינם ללקוחות בקומת הקרקע.
        </p>
        <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11.5px] font-bold">
          <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-white/90 text-brand-700">
            ✓
          </span>
          מבוסס על עמוד ״שירות ומיקום״ באתר שלך
        </div>
      </div>

      {/* Ambient depth, not decoration — one soft light, kept behind the content. */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
    </motion.div>
  );
}

function FeatureCard({ f, i }: { f: Feature; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: EASE, delay: (i % 4) * 0.06 }}
      className="group relative flex flex-col rounded-[22px] border border-line bg-white p-5 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1"
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cloud text-brand-700 transition-colors group-hover:bg-brand group-hover:text-white">
          {f.icon}
        </span>
        {f.badge && (
          <span className="rounded-full bg-cloud px-2.5 py-1 text-[11px] font-bold text-brand-700">
            {f.badge}
          </span>
        )}
      </div>
      <h3 className="text-[16.5px] font-bold text-ink">{f.title}</h3>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">{f.desc}</p>
    </motion.div>
  );
}

/* ---- icons ---- */
const s = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
function IconBrain() { return <svg width="15" height="15" viewBox="0 0 24 24" {...s}><path d="M12 5a3 3 0 0 0-6 0 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 0Zm0 0a3 3 0 0 1 6 0 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 0" /></svg>; }
function IconMic() { return <svg width="20" height="20" viewBox="0 0 24 24" {...s}><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>; }
function IconLead() { return <svg width="20" height="20" viewBox="0 0 24 24" {...s}><path d="M20 8v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7Z" /><path d="M9 12h6M9 16h4M14 3v4h4" /></svg>; }
function IconPlug() { return <svg width="20" height="20" viewBox="0 0 24 24" {...s}><path d="M9 2v6M15 2v6M7 8h10v3a5 5 0 0 1-10 0V8ZM12 16v6" /></svg>; }
function IconGlobe() { return <svg width="20" height="20" viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" /></svg>; }
function IconBell() { return <svg width="20" height="20" viewBox="0 0 24 24" {...s}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M10.5 21a2 2 0 0 0 3 0" /></svg>; }
function IconChart() { return <svg width="20" height="20" viewBox="0 0 24 24" {...s}><path d="M3 3v18h18M8 14v4M13 10v8M18 6v12" /></svg>; }
function IconRocket() { return <svg width="20" height="20" viewBox="0 0 24 24" {...s}><path d="M5 13c-1.5 1.5-2 5-2 5s3.5-.5 5-2M12 15l-3-3a10 10 0 0 1 8-9c1 3 0 6-3 9ZM15 9a1 1 0 1 0 0-.01" /></svg>; }
function IconWordpress() { return <svg width="20" height="20" viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9.5" /><path d="M3.2 9.5 8 20.5M9.5 8.3 13.2 20 15.7 12M8 8.2h3M14 8.2h2.5c1.4 0 1.9 2 1 3.8L15.7 12" /></svg>; }
