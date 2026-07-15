"use client";

import { motion } from "motion/react";
import { Reveal } from "./Reveal";

const audiences = [
  { emoji: "🏥", title: "קליניקות ומרפאות", desc: "מענה על טיפולים, תיאום פניות והפניית מטופלים למחלקה הנכונה." },
  { emoji: "🛠️", title: "עסקי שירות", desc: "שרברבים, מוסכים, נותני שירות — לוכד לידים גם כשאתם עסוקים." },
  { emoji: "🛒", title: "חנויות ומסחר", desc: "עונה על שאלות מוצר, משלוחים והחזרות לפי תוכן האתר, ומפנה גולשים לרכישה." },
  { emoji: "🏘️", title: "נדל\"ן ותיווך", desc: "סינון מתעניינים, מענה על נכסים ותיאום צפיות אוטומטי." },
  { emoji: "🎓", title: "חינוך והדרכה", desc: "מענה על קורסים, הרשמות ושאלות נפוצות — מסביב לשעון." },
  { emoji: "💼", title: "עסקים ומשרדים", desc: "כל אתר תדמית שרוצה ללכוד פניות ולתת שירות ראשוני חכם." },
];

export function WhoFor() {
  return (
    <section id="who" className="relative py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="mb-3 text-[15px] font-bold text-brand-700">למי זה מתאים</div>
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
            לכל עסק שיש לו אתר — ורוצה יותר לקוחות
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="flex items-start gap-4 rounded-3xl border border-line bg-white p-6 shadow-[var(--shadow-card)]"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cloud text-2xl">
                {a.emoji}
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-ink">{a.title}</h3>
                <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">{a.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
