"use client";

import { motion } from "motion/react";
import { Reveal } from "./Reveal";

const perks = [
  { t: "לינק הפניה קבוע", d: "קישור אישי — כל לקוח שמגיע דרכו נרשם אליך אוטומטית." },
  { t: "קופון הנחה ללקוחות", d: "תנו הנחה בשם שלכם וסגרו יותר עסקאות." },
  { t: "עמלה מתגלגלת", d: "עד 25% מההקמה + עד 25% מהמנוי — כל חודש, כל עוד הלקוח פעיל." },
  { t: "לוח מעקב הפניות", d: "רואים בזמן אמת כמה הפניתם, מי נסגר וכמה הרווחתם." },
];

export function Partners() {
  return (
    <section id="partners" className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="relative overflow-hidden rounded-[36px] bg-brand-900 px-7 py-14 sm:px-14">
          <div className="blob brand-gradient" style={{ width: 420, height: 420, top: -160, left: -120, opacity: 0.5 }} />
          <div className="relative z-10 grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Reveal>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[13px] font-semibold text-white">
                  🤝 לבוני אתרים וסוכנויות
                </div>
                <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                  הרוויחו הכנסה חוזרת מכל לקוח
                </h2>
                <p className="mt-4 max-w-md text-[16px] leading-relaxed text-white/70">
                  הוסיפו את Wisply לשירותים שלכם. אתם מפנים (או מקימים) — ומקבלים עמלה
                  חד-פעמית + סכום שמתגלגל כל חודש. עם אזור אישי מלא לניהול ההפניות.
                </p>
                <a
                  href="/partners"
                  className="mt-8 inline-block rounded-full bg-accent px-7 py-3.5 text-[16px] font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,122,89,0.6)] transition-transform hover:-translate-y-0.5"
                >
                  להצטרפות כשותף →
                </a>
              </Reveal>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {perks.map((p, i) => (
                <motion.div
                  key={p.t}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="rounded-2xl bg-white/[0.06] p-5 backdrop-blur ring-1 ring-white/10"
                >
                  <div className="text-[15px] font-bold text-white">{p.t}</div>
                  <div className="mt-1.5 text-[13.5px] leading-relaxed text-white/60">{p.d}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
