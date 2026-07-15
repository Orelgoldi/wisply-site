"use client";

import { Reveal } from "./Reveal";

export function CTA() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-4xl px-5">
        <Reveal className="rounded-[36px] border border-line bg-white p-10 text-center shadow-[var(--shadow-soft)] sm:p-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
            מוכנים לבוט ש<span className="grad-text">עובד בשבילכם</span>?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-soft">
            נקים לכם את Wisply תוך ימים — עברית מלאה, מחובר למערכות שלכם, ומוכן ללכוד לקוחות.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <a
              href="/signup"
              className="rounded-full bg-accent px-8 py-4 text-[16px] font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,122,89,0.7)] transition-transform hover:-translate-y-0.5"
            >
              התחילו עכשיו
            </a>
            <a
              href="https://wa.me/972500000000"
              className="rounded-full border border-line bg-white px-8 py-4 text-[16px] font-bold text-ink transition-colors hover:border-brand hover:text-brand-700"
            >
              דברו איתנו בוואטסאפ
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
