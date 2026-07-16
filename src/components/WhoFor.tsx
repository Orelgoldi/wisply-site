"use client";

import { motion } from "motion/react";
import { Reveal } from "./Reveal";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const audiences = [
  { img: "/who/clinic.webp", title: "קליניקות ומרפאות", desc: "מענה על טיפולים והפניית מטופלים למחלקה הנכונה." },
  { img: "/who/service.webp", title: "עסקי שירות", desc: "שרברבים, מוסכים, נותני שירות — לוכד לידים גם כשאתם עסוקים." },
  { img: "/who/commerce.webp", title: "חנויות ומסחר", desc: "עונה על שאלות מוצר, משלוחים והחזרות לפי תוכן האתר, ומפנה גולשים לרכישה." },
  { img: "/who/realestate.webp", title: "נדל\"ן ותיווך", desc: "סינון מתעניינים, מענה על נכסים ותיאום צפיות אוטומטי." },
  { img: "/who/education.webp", title: "חינוך והדרכה", desc: "מענה על קורסים, הרשמות ושאלות נפוצות — מסביב לשעון." },
  { img: "/who/office.webp", title: "עסקים ומשרדים", desc: "כל אתר תדמית שרוצה ללכוד פניות ולתת שירות ראשוני חכם." },
];

export function WhoFor() {
  return (
    <section id="who" className="relative py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="mb-3 text-[15px] font-bold text-brand-700">למי זה מתאים</div>
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
            לכל עסק שיש לו אתר ורוצה יותר לקוחות
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: EASE }}
              className="group rounded-3xl border border-line bg-white p-6 text-center shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1"
            >
              <div className="mx-auto mb-5 grid h-28 w-28 place-items-center overflow-hidden rounded-2xl bg-cloud">
                <img
                  src={a.img}
                  alt={a.title}
                  width={360}
                  height={360}
                  loading="lazy"
                  className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="text-[18px] font-bold text-ink">{a.title}</h3>
              <p className="mx-auto mt-1.5 max-w-xs text-[14px] leading-relaxed text-ink-soft">{a.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
