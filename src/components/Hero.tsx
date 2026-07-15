"use client";

import { motion } from "motion/react";
import { ChatDemo } from "./ChatDemo";

const fade = {
  hidden: { opacity: 0, y: 22 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.15 + i * 0.12 },
  }),
};

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="blob brand-gradient" style={{ width: 480, height: 480, top: -160, right: -120 }} />
      <div className="blob" style={{ width: 380, height: 380, bottom: -140, left: -100, background: "#ffd9a0" }} />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-2">
        <div>
          <motion.div
            custom={0}
            initial="hidden"
            animate="show"
            variants={fade}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3.5 py-1.5 text-[13px] font-semibold text-brand-700 backdrop-blur"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-brand" />
            עוזר AI חכם לאתר — בעברית מלאה
          </motion.div>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="show"
            variants={fade}
            className="text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-6xl"
          >
            הבוט ש<span className="grad-text">עונה, משכנע</span>
            <br />
            ולוכד לקוחות — 24/7
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="show"
            variants={fade}
            className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft"
          >
            Wisply עונה לגולשים על בסיס תוכן האתר שלך, מדבר בקול, לוכד לידים
            ושולח אותם ישר ל-CRM ולדיוור. אנחנו מקימים ומנהלים — אתם מקבלים לקוחות.
          </motion.p>

          <motion.div
            custom={3}
            initial="hidden"
            animate="show"
            variants={fade}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <a
              href="#pricing"
              className="rounded-full bg-accent px-7 py-3.5 text-[16px] font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,122,89,0.7)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              התחילו — ללא סיכון
            </a>
            <a
              href="#features"
              className="rounded-full border border-line bg-white px-7 py-3.5 text-[16px] font-bold text-ink transition-colors hover:border-brand hover:text-brand-700"
            >
              איך זה עובד ↓
            </a>
          </motion.div>

          <motion.div
            custom={4}
            initial="hidden"
            animate="show"
            variants={fade}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-mist"
          >
            <span>✓ עברית · אנגלית · רוסית</span>
            <span>✓ הקמה תוך ימים</span>
            <span>✓ ללא שיחות — ללא תשלום</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.3 }}
          className="flex justify-center lg:justify-end"
        >
          <ChatDemo />
        </motion.div>
      </div>
    </section>
  );
}
