"use client";

import { motion } from "motion/react";
import { Reveal } from "./Reveal";

const plans = [
  { id: "lite", name: "Lite", price: "₪99", per: "/חודש", tag: "לעסק קטן", points: ["500 שיחות", "עברית", "לכידת לידים", "חיבור 1"], accent: false },
  { id: "business", name: "Business", price: "₪249", per: "/חודש", tag: "הכי נפוץ", points: ["2,000 שיחות", "שיחות קול", "3 שפות", "2 חיבורים"], accent: true },
  { id: "pro", name: "Pro", price: "₪549", per: "/חודש", tag: "נפח גבוה", points: ["5,000 שיחות", "300 דק׳ קול", "חיבורים ללא הגבלה", "דוחות מלאים"], accent: false },
  { id: "enterprise", name: "Enterprise", price: "מ-₪990", per: "/חודש", tag: "ארגונים", points: ["ללא הגבלה", "קול Real-Time", "AI פרימיום", "SLA"], accent: false },
];

/** Where a plan's CTA goes: paid plans open checkout, enterprise is a contact link. */
function planCta(id: string): { href: string; label: string } {
  if (id === "enterprise") return { href: "mailto:hello@wisply.io?subject=Wisply Enterprise", label: "דברו איתנו" };
  return { href: `/checkout?plan=${id}`, label: "לרכישה" };
}

export function Pricing() {
  return (
    <section id="pricing" className="relative overflow-hidden py-24">
      <div className="blob brand-gradient" style={{ width: 420, height: 420, top: 40, left: -160, opacity: 0.35 }} />
      <div className="relative z-10 mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="mb-3 text-[15px] font-bold text-brand-700">מחירים</div>
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
            מתחילים ללא סיכון — משלמים רק כשמדברים
          </h2>
          <p className="mt-5 text-lg text-ink-soft">כל המחירים כוללים מע״מ. מנוי חודשי גמיש + הקמה חד-פעמית.</p>
        </Reveal>

        {/* Spark highlight */}
        <Reveal delay={0.05} className="mx-auto mt-12 max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border-2 border-dashed border-brand bg-white p-6 shadow-[var(--shadow-card)]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-3 py-1 text-[12px] font-bold text-white">
                חדש · ללא סיכון
              </div>
              <div className="mt-2 text-xl font-extrabold text-ink">Wisply Spark ✨</div>
              <div className="text-[14px] text-ink-soft">משלמים רק כשמדברים — אין שיחות, אין תשלום.</div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="text-center">
                <div className="text-3xl font-extrabold text-ink">₪1 <span className="text-sm font-medium text-mist">/ שיחה</span></div>
                <div className="text-[13px] text-mist">₪0 דמי מנוי קבועים</div>
              </div>
              <a
                href="/signup"
                className="rounded-full bg-brand-700 px-6 py-2 text-[14px] font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                התחלה חינם
              </a>
            </div>
          </div>
        </Reveal>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className={`relative rounded-3xl border bg-white p-6 ${
                p.accent ? "border-2 border-brand shadow-[var(--shadow-soft)]" : "border-line shadow-[var(--shadow-card)]"
              }`}
            >
              {p.accent && (
                <div className="absolute -top-3 right-1/2 translate-x-1/2 rounded-full bg-brand-700 px-3 py-1 text-[11px] font-bold text-white">
                  מומלץ
                </div>
              )}
              <div className="text-[15px] font-bold text-brand-700">{p.name}</div>
              <div className="mt-1 text-[13px] text-mist">{p.tag}</div>
              <div className="mt-3 text-3xl font-extrabold text-ink">
                {p.price}
                <span className="text-sm font-medium text-mist">{p.per}</span>
              </div>
              <ul className="mt-5 space-y-2.5 text-[14px] text-ink-soft">
                {p.points.map((pt) => (
                  <li key={pt} className="flex items-center gap-2">
                    <span className="text-brand">✓</span> {pt}
                  </li>
                ))}
              </ul>
              <a
                href={planCta(p.id).href}
                className={`mt-6 block rounded-full py-2.5 text-center text-[15px] font-bold transition-transform hover:-translate-y-0.5 ${
                  p.accent ? "bg-accent text-white" : "bg-cloud text-ink hover:bg-line"
                }`}
              >
                {planCta(p.id).label}
              </a>
            </motion.div>
          ))}
        </div>

        <Reveal delay={0.05} className="mx-auto mt-10 max-w-3xl">
          <div className="rounded-3xl border border-line bg-white p-7 text-center shadow-[var(--shadow-card)]">
            <div className="text-[15px] font-bold text-brand-700">הקמה חד-פעמית</div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
              <span className="text-xl font-extrabold text-ink sm:text-2xl">
                Basic <span className="text-brand-700">₪690</span>
              </span>
              <span className="hidden text-line sm:inline">·</span>
              <span className="text-xl font-extrabold text-ink sm:text-2xl">
                Plus <span className="text-brand-700">₪1,290</span>
              </span>
              <span className="hidden text-line sm:inline">·</span>
              <span className="text-xl font-extrabold text-ink sm:text-2xl">
                Tailor-Made{" "}
                <span className="text-base font-semibold text-mist">במחירי השקה</span>
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
