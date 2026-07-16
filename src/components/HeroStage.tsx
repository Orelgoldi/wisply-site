"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * The hero's floating scene: the generated centre image (woman + colour circle)
 * with every bubble, the panel and the input bar built as real DOM on top.
 *
 * Why not one flat generated picture: the artwork's Hebrew is only as good as the
 * model's rendering, it can't be edited without regenerating, it blurs on retina,
 * and nothing inside it can move independently. As DOM, the Hebrew is the real
 * font, the copy is a one-line edit, and each element animates on its own.
 * (Slicing the flat render into layers was tried first and cannot work — the cards
 * overlap the circle, so every slice drags a fragment of it along.)
 */

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** Enters once, then breathes forever. `i` staggers the entrance. */
function Float({
  children,
  className,
  i = 0,
  amp = 9,
  dur = 5.5,
}: {
  children: ReactNode;
  className?: string;
  i?: number;
  amp?: number;
  dur?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.55 + i * 0.14 }}
    >
      <motion.div
        animate={{ y: [0, -amp, 0] }}
        transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

const card = "rounded-2xl bg-white shadow-[0_18px_45px_-18px_rgba(11,31,36,0.28)]";

function Bubble({ children, tone = "white" }: { children: ReactNode; tone?: "white" | "teal" }) {
  return (
    <div
      className={[
        "max-w-[15rem] rounded-2xl px-4 py-3 text-[13.5px] font-semibold leading-snug",
        "shadow-[0_18px_45px_-18px_rgba(11,31,36,0.28)]",
        tone === "teal" ? "bg-brand text-white" : "bg-white text-ink",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/* Three rows, not five: the stage only gets whatever height the copy leaves over
   (~390px on a 820px laptop), and a taller panel collides with the bubbles below it. */
const CHATS = [
  { name: "דניאל לוי", q: "אילו טיפולים אתם מציעים?", face: "/hero/faces/1.webp" },
  { name: "נועה ברק", q: "יש חניה במקום?", face: "/hero/faces/2.webp" },
  { name: "שרון אדרי", q: "המוצר מגיע עם אחריות?", face: "/hero/faces/3.webp" },
];

export function HeroStage() {
  return (
    <div className="relative mx-auto h-full w-full max-w-[1180px]">
      {/* Centre: the only generated asset left. */}
      <motion.img
        src="/hero/stage.webp"
        alt="גולשת שואלת את הבוט של Wisply שאלות מהטלפון"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
        className="mx-auto h-full w-auto max-w-none object-contain"
        fetchPriority="high"
      />

      {/* Everything below is DOM. Hidden on small screens, where there is no room
          for it and the centre image carries the hero on its own. */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <Float i={0} className="absolute right-0 top-0" dur={6}>
          <div className={`${card} w-60 p-4`}>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand text-white">
                {/* A real speech bubble. The previous path was invented and drew nothing
                    recognisable — never hand-write SVG geometry from memory. */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 3C6.9 3 3 6.4 3 10.6c0 2.4 1.3 4.5 3.3 5.9v3.3a.6.6 0 0 0 .95.5l3.1-2.2c.5.07 1.1.1 1.65.1 5.1 0 9-3.4 9-7.6S17.1 3 12 3Z" />
                  <circle cx="8.4" cy="10.6" r="1.15" fill="#fff" />
                  <circle cx="12" cy="10.6" r="1.15" fill="#fff" />
                  <circle cx="15.6" cy="10.6" r="1.15" fill="#fff" />
                </svg>
              </span>
              <p className="text-[13.5px] font-bold leading-tight text-ink">עונה על כל שאלה באתר</p>
            </div>
            <div className="mt-3 rounded-full bg-brand py-2 text-center text-[13px] font-bold text-white">
              התחל שיחה
            </div>
          </div>
        </Float>

        <Float i={1} className="absolute right-[3%] top-[46%]" dur={5}>
          <Bubble tone="teal">מה התנאים לקבלה למחלקת שיקום?</Bubble>
        </Float>

        <Float i={2} className="absolute right-[6%] top-[72%]" dur={6.5}>
          <Bubble>נדרשת הפניית רופא והתחייבות מקופת חולים</Bubble>
        </Float>

        <Float i={3} className="absolute left-[2%] top-[54%]" dur={5.5}>
          <Bubble>יש לכם כיסא ארגונומי בשחור?</Bubble>
        </Float>

        {/* The product card: what the e-commerce module actually returns. No price —
            a number here reads as Wisply's own pricing, which it is not. */}
        <Float i={4} className="absolute left-[5%] top-[72%]" dur={6}>
          <div className={`${card} flex w-[15.5rem] items-center gap-3 p-3`}>
            <div className="min-w-0 flex-1 text-right">
              <p className="truncate text-[13px] font-bold text-ink">כיסא ארגונומי ספירה</p>
              <span className="mt-1.5 inline-block rounded-full bg-brand px-2.5 py-1 text-[11.5px] font-bold text-white">
                במלאי
              </span>
            </div>
            <img
              src="/hero/chair.webp"
              alt="כיסא ארגונומי שחור"
              className="h-14 w-14 shrink-0 rounded-xl bg-cloud object-contain"
              loading="lazy"
            />
          </div>
        </Float>

        <Float i={5} className="absolute left-0 top-0" amp={7} dur={7}>
          <div className={`${card} w-[15rem] p-3.5`}>
            <p className="mb-2.5 text-right text-[13.5px] font-extrabold text-ink">שיחות פעילות</p>
            <ul className="space-y-2">
              {CHATS.map((c) => (
                <li key={c.name} className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <div className="min-w-0 flex-1 text-right">
                    <p className="text-[12.5px] font-bold leading-tight text-ink">{c.name}</p>
                    <p className="truncate text-[11.5px] leading-tight text-mist">{c.q}</p>
                  </div>
                  <img
                    src={c.face}
                    alt=""
                    className="h-7 w-7 shrink-0 rounded-full object-cover"
                    loading="lazy"
                  />
                </li>
              ))}
            </ul>
            <p className="mt-3 text-right text-[12px] font-bold text-brand-700">לכל השיחות</p>
          </div>
        </Float>
      </div>
    </div>
  );
}
