"use client";

import { motion } from "motion/react";
import { HeroStage } from "./HeroStage";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay: 0.1 + i * 0.1 },
  }),
};

export function Hero() {
  return (
    /* One screen, guaranteed: the copy takes the height it needs and the stage gets
       the rest via flex-1 + min-h-0, so the image scales to fit instead of pushing
       the fold down. min-h-[46rem] keeps it usable on a short laptop window. */
    <section
      id="top"
      className="relative flex min-h-[46rem] flex-col overflow-hidden pt-24 sm:h-screen sm:pt-28"
    >
      <div className="blob brand-gradient" style={{ width: 420, height: 420, top: -190, right: -150 }} />
      <div className="blob" style={{ width: 340, height: 340, top: -110, left: -130, background: "#ffd9a0" }} />

      <div className="relative z-20 mx-auto w-full max-w-4xl shrink-0 px-5 text-center">
        <motion.h1
          custom={0}
          initial="hidden"
          animate="show"
          variants={fade}
          className="text-[34px] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-[56px]"
        >
          <span className="grad-text">עונה. משכנע.</span>
          <br />
          משיג לקוחות 24/7.
        </motion.h1>

        <motion.p
          custom={1}
          initial="hidden"
          animate="show"
          variants={fade}
          className="mx-auto mt-4 max-w-xl text-[15.5px] leading-relaxed text-ink-soft sm:text-[17px]"
        >
          Wisply עונה לגולשים על סמך התוכן של האתר שלכם בלבד, אף פעם לא ממציא,
          ולוכד לידים ישר ל-CRM. אנחנו מקימים ומנהלים, אתם מקבלים לקוחות.
        </motion.p>

        <motion.div
          custom={2}
          initial="hidden"
          animate="show"
          variants={fade}
          className="mt-6 flex flex-wrap items-center justify-center gap-3.5"
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

        <motion.p
          custom={3}
          initial="hidden"
          animate="show"
          variants={fade}
          className="mt-4 text-[13.5px] font-medium text-mist"
        >
          מותקן כתוסף וורדפרס · עדכונים אוטומטיים · תמיכה בפלטפורמות נוספות בהמשך
        </motion.p>
      </div>

      <div className="relative z-10 mt-6 min-h-0 flex-1 px-4 sm:mt-8">
        <HeroStage />
      </div>
    </section>
  );
}
