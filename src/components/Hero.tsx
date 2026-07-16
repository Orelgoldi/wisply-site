"use client";

import { motion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fade = {
  hidden: { opacity: 0, y: 22 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE, delay: 0.12 + i * 0.11 },
  }),
};

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-36">
      <div className="blob brand-gradient" style={{ width: 460, height: 460, top: -180, right: -140 }} />
      <div className="blob" style={{ width: 360, height: 360, top: -80, left: -120, background: "#ffd9a0" }} />

      <div className="relative z-10 mx-auto max-w-5xl px-5 text-center">
        <motion.div
          custom={0}
          initial="hidden"
          animate="show"
          variants={fade}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3.5 py-1.5 text-[13px] font-semibold text-brand-700 backdrop-blur"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-brand" />
          עוזר AI לאתר, בעברית מלאה
        </motion.div>

        <motion.h1
          custom={1}
          initial="hidden"
          animate="show"
          variants={fade}
          className="text-[38px] font-extrabold leading-[1.08] tracking-tight text-ink sm:text-[68px]"
        >
          שאלו אותו הכל.
          <br />
          <span className="grad-text">הוא קרא את כל האתר.</span>
        </motion.h1>

        <motion.p
          custom={2}
          initial="hidden"
          animate="show"
          variants={fade}
          className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-ink-soft sm:text-lg"
        >
          Wisply עונה לגולשים שלכם על סמך התוכן של האתר שלכם בלבד, אף פעם לא ממציא,
          ולוכד לידים ישר ל-CRM. אנחנו מקימים ומנהלים, אתם מקבלים לקוחות.
        </motion.p>

        <motion.div
          custom={3}
          initial="hidden"
          animate="show"
          variants={fade}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="#pricing"
            className="rounded-full bg-accent px-8 py-3.5 text-[16px] font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,122,89,0.7)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            התחילו עכשיו
          </a>
          <a
            href="#features"
            className="rounded-full border border-line bg-white px-8 py-3.5 text-[16px] font-bold text-ink transition-colors hover:border-brand hover:text-brand-700"
          >
            איך זה עובד ↓
          </a>
        </motion.div>

        <motion.div
          custom={4}
          initial="hidden"
          animate="show"
          variants={fade}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[14px] text-mist"
        >
          <span>✓ הקמה תוך ימים</span>
          <span>✓ ללא שיחות, ללא תשלום</span>
          <span>✓ עונה גם בקול</span>
        </motion.div>
      </div>

      {/* The visual.
          The full-bleed band matches the artwork's own #f7fafa backdrop exactly. The
          body is #f4fafa, and that three-point difference is enough to draw a visible
          rectangle around a contained image — the band hides the seam without anyone
          having to notice it was there.
          Art direction: the wide composition pushes the chat panel and the bubbles out
          to the edges, where a phone shrinks them into noise, so small screens get a
          crop centred on her and the circle instead. */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.45 }}
        className="relative z-10 mt-10 bg-[#f7fafa] sm:mt-14"
      >
        <div className="mx-auto max-w-[1240px]">
          <picture>
            <source media="(max-width: 639px)" srcSet="/hero/hero-mobile.webp" />
            <img
              src="/hero/hero.webp"
              alt="גולשים שואלים את Wisply שאלות על תוכן האתר, כמו תנאי קבלה למחלקת שיקום או האם מוצר קיים במלאי, והבוט עונה מיד. לצד זה פאנל השיחות הפעילות של בעל האתר."
              width={2200}
              height={1244}
              fetchPriority="high"
              className="h-auto w-full"
            />
          </picture>
        </div>
      </motion.div>
    </section>
  );
}
