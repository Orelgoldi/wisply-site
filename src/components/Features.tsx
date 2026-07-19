"use client";

import { motion } from "motion/react";
import { Reveal } from "./Reveal";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

type Feature = { icon: ReactNode; title: string; desc: string };

/* The thesis lives in its own tile (below). These eight are the supporting cast. */
const features: Feature[] = [
  {
    icon: <IconMic />,
    title: "מדבר ומקשיב בקול",
    desc: "הקראה קולית ושיחות קול דו-כיווניות, כולל מצב Real-Time של דיבור רציף ללא השהיה.",
  },
  {
    icon: <IconLead />,
    title: "לוכד לידים אוטומטית",
    desc: "מזהה עניין, מבקש פרטים עם הסכמה שיווקית תקנית, ושומר כל ליד עם סיכום השיחה המלא.",
  },
  {
    icon: <IconConnect />,
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
  },
  {
    icon: <IconWand />,
    title: "מוקם ומנוהל עבורך",
    desc: "אנחנו מתקינים, מאמנים, מעצבים ומחברים. אתם רק מקבלים לידים — Done-for-you.",
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
      className="group relative flex flex-col overflow-hidden rounded-[22px] border border-line bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[var(--shadow-soft)]"
    >
      {/* A soft brand glow that wakes on hover — depth, kept behind the content. */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand/5 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative mb-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cloud to-white ring-1 ring-line transition-all duration-300 group-hover:ring-brand/30 group-hover:shadow-[0_10px_22px_-10px_rgba(0,179,176,0.5)]">
          <span className="transition-transform duration-300 will-change-transform group-hover:scale-110">
            {f.icon}
          </span>
        </span>
      </div>
      <h3 className="relative text-[18.5px] font-bold text-ink">{f.title}</h3>
      <p className="relative mt-2 text-[15px] leading-relaxed text-ink-soft">{f.desc}</p>
    </motion.div>
  );
}

/* ---- duotone illustrated icons ----
   One visual language shared with the WhoFor illustrations: teal fills, a deep
   teal outline, and a single coral (or gold) spark per icon. Hand-authored SVG so
   they stay crisp at any size and identical in style across the set. */

const LIGHT = "#c3ebe8"; // teal fill
const TEAL = "#00b3b0"; // brand teal detail
const DARK = "#05494c"; // deep-teal outline
const CORAL = "#ff7a59"; // warm accent
const GOLD = "#ffb020"; // spark

type IconProps = { children: ReactNode };
function Frame({ children }: IconProps) {
  return (
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

function IconMic() {
  return (
    <Frame>
      <rect x="15" y="6" width="10" height="18" rx="5" fill={LIGHT} stroke={DARK} strokeWidth="2" />
      <path d="M20 10v6" stroke={TEAL} strokeWidth="2" />
      <path d="M11 19a9 9 0 0 0 18 0" stroke={DARK} strokeWidth="2" />
      <path d="M20 28v6M16 34h8" stroke={DARK} strokeWidth="2" />
      <path d="M31 15c1.6 1.6 1.6 6 0 8M34.5 12c3 3.4 3 12 0 15" stroke={CORAL} strokeWidth="2" />
    </Frame>
  );
}

function IconLead() {
  /* A magnet catching a spark — leads pulled in on their own. */
  return (
    <Frame>
      <path d="M12 9v8a8 8 0 0 0 16 0V9" stroke={DARK} strokeWidth="8" />
      <path d="M12 9v8a8 8 0 0 0 16 0V9" stroke={LIGHT} strokeWidth="3.4" />
      <path d="M12 9v3.4M28 9v3.4" stroke={CORAL} strokeWidth="3.4" />
      <path d="M20 3.5v3.5M16.5 5.5l1.6 1.6M23.5 5.5l-1.6 1.6" stroke={GOLD} strokeWidth="2" />
    </Frame>
  );
}

function IconConnect() {
  /* Hub-and-spoke — one bot wired into every system. */
  return (
    <Frame>
      <path d="M20 20 11 13M20 20l9-4M20 20l4 9" stroke={DARK} strokeWidth="2" />
      <circle cx="11" cy="13" r="4" fill={LIGHT} stroke={DARK} strokeWidth="2" />
      <circle cx="29" cy="16" r="4" fill={LIGHT} stroke={DARK} strokeWidth="2" />
      <circle cx="24" cy="29" r="4" fill={CORAL} stroke={DARK} strokeWidth="2" />
      <circle cx="20" cy="20" r="5.5" fill={TEAL} stroke={DARK} strokeWidth="2" />
    </Frame>
  );
}

function IconGlobe() {
  return (
    <Frame>
      <circle cx="17" cy="18" r="11" fill={LIGHT} stroke={DARK} strokeWidth="2" />
      <path d="M6 18h22" stroke={DARK} strokeWidth="1.6" />
      <path d="M17 7c4.6 3 4.6 19 0 22c-4.6-3-4.6-19 0-22Z" stroke={DARK} strokeWidth="1.6" />
      <path
        d="M25 24.5h8a2.5 2.5 0 0 1 2.5 2.5v3.5A2.5 2.5 0 0 1 33 33h-1v3l-3.5-3H25a2.5 2.5 0 0 1-2.5-2.5V27A2.5 2.5 0 0 1 25 24.5Z"
        fill={CORAL}
        stroke={DARK}
        strokeWidth="2"
      />
      <path d="M26.5 28.5h5M26.5 31h3" stroke="#fff" strokeWidth="1.6" />
    </Frame>
  );
}

function IconBell() {
  /* Proactive outreach — the bubble pops up first, with a live notification. */
  return (
    <Frame>
      <path
        d="M9 10h18a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4H18l-6 5v-5h-3a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4Z"
        fill={LIGHT}
        stroke={DARK}
        strokeWidth="2"
      />
      <circle cx="14" cy="18.5" r="1.7" fill={TEAL} />
      <circle cx="19" cy="18.5" r="1.7" fill={TEAL} />
      <circle cx="24" cy="18.5" r="1.7" fill={TEAL} />
      <circle cx="31" cy="9" r="4.5" fill={CORAL} stroke="#fff" strokeWidth="1.6" />
    </Frame>
  );
}

function IconChart() {
  return (
    <Frame>
      <path d="M11 6h11l7 7v19a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" fill={LIGHT} stroke={DARK} strokeWidth="2" />
      <path d="M22 6v7h7" stroke={DARK} strokeWidth="2" />
      <path d="M14 29v-3M19 29v-6M24 29v-4" stroke={TEAL} strokeWidth="2.6" />
      <path d="M13.5 20l4-3.5 3 2 5-4.5" stroke={CORAL} strokeWidth="2" />
    </Frame>
  );
}

function IconWordpress() {
  return (
    <Frame>
      <circle cx="20" cy="20" r="13" fill={LIGHT} stroke={DARK} strokeWidth="2" />
      <path d="M12 15.5l3.4 10.5 3-8.2 3 8.2 3.4-10.5" stroke={TEAL} strokeWidth="2.4" />
      <circle cx="20" cy="20" r="13" stroke={DARK} strokeWidth="0" />
    </Frame>
  );
}

function IconWand() {
  /* Done-for-you — we handle the setup; a wand and a star do the work. */
  return (
    <Frame>
      <path d="M11.5 30.5 25 17" stroke={DARK} strokeWidth="4" />
      <path d="M11.5 30.5 25 17" stroke={TEAL} strokeWidth="1.8" />
      <path d="M26.5 9.5 29 14l4.5 2.5L29 19l-2.5 4.5L24 19l-4.5-2.5L24 14Z" fill={GOLD} stroke={DARK} strokeWidth="1.8" />
      <path d="M11 11v4M9 13h4" stroke={CORAL} strokeWidth="2" />
      <circle cx="31" cy="27" r="1.7" fill={CORAL} />
    </Frame>
  );
}
