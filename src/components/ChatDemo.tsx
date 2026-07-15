"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Logo } from "./Logo";

type Msg = { from: "bot" | "user"; text: string };

const script: Msg[] = [
  { from: "bot", text: "היי 👋 אני העוזר החכם של האתר. איך אפשר לעזור?" },
  { from: "user", text: "אתם עושים שיקום אחרי ניתוח?" },
  { from: "bot", text: "כן! יש לנו מחלקת החלמה ייעודית. רוצה שאחזור אליך עם פרטים?" },
  { from: "user", text: "כן, בבקשה" },
  { from: "bot", text: "מעולה — השאר שם וטלפון ונחזור אליך היום 📞" },
];

export function ChatDemo() {
  const [count, setCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    function run(i: number) {
      if (!alive) return;
      if (i >= script.length) {
        timers.push(setTimeout(() => {
          if (!alive) return;
          setCount(0);
          run(0);
        }, 3200));
        return;
      }
      const isBot = script[i].from === "bot";
      const delay = isBot ? 900 : 650;
      if (isBot) setTyping(true);
      timers.push(
        setTimeout(() => {
          if (!alive) return;
          setTyping(false);
          setCount(i + 1);
          run(i + 1);
        }, delay)
      );
    }
    run(0);
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9999, behavior: "smooth" });
  }, [count, typing]);

  return (
    <div className="relative w-full max-w-[360px]">
      <div className="overflow-hidden rounded-[26px] border border-line bg-white shadow-[0_30px_80px_-30px_rgba(0,90,92,0.45)]">
        {/* header */}
        <div className="brand-gradient flex items-center gap-2.5 px-4 py-3.5 text-white">
          <Logo variant="mark" tone="white" />
          <div className="leading-tight">
            <div className="text-[15px] font-bold">העוזר החכם</div>
            <div className="flex items-center gap-1.5 text-[11px] opacity-90">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-300" />
              מחובר
            </div>
          </div>
        </div>
        {/* messages */}
        <div ref={scrollRef} className="dotgrid h-[300px] space-y-2.5 overflow-y-auto bg-cloud px-3.5 py-4">
          <AnimatePresence initial={false}>
            {script.slice(0, count).map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                className={`flex ${m.from === "user" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-sm ${
                    m.from === "user"
                      ? "rounded-bl-md bg-white text-ink"
                      : "rounded-br-md bg-brand-700 text-white"
                  }`}
                >
                  {m.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
              <div className="flex items-center gap-1 rounded-2xl rounded-br-md bg-brand-700 px-3.5 py-3">
                {[0, 1, 2].map((d) => (
                  <motion.span
                    key={d}
                    className="h-1.5 w-1.5 rounded-full bg-white/90"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
        {/* input */}
        <div className="flex items-center gap-2 border-t border-line bg-white px-3 py-2.5">
          <div className="flex-1 rounded-full bg-cloud px-3.5 py-2 text-[13px] text-mist">כתוב/י הודעה…</div>
          <div className="brand-gradient grid h-8 w-8 place-items-center rounded-full text-white">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* floating lead card */}
      <motion.div
        initial={{ opacity: 0, x: -20, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute -bottom-5 -left-6 hidden rounded-2xl border border-line bg-white px-4 py-3 shadow-[var(--shadow-card)] sm:block"
      >
        <div className="text-[11px] font-semibold text-mist">ליד חדש 🎯</div>
        <div className="text-[13px] font-bold text-ink">נשלח ל-CRM ✓</div>
      </motion.div>
    </div>
  );
}
