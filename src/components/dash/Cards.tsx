import type { ReactNode } from "react";
import { ILS } from "@/lib/types";
import type { MonthPoint } from "@/lib/partner-data";

/** Card with the mint header bar (the "הכסף שלי" look). */
export function MintCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)]">
      <header className="bg-mint px-6 py-4 text-right">
        <h2 className="text-[19px] font-extrabold text-navy-900">{title}</h2>
        {subtitle && <p className="text-[12.5px] text-navy-900/60">{subtitle}</p>}
      </header>
      <div className="px-6 py-7">{children}</div>
      {footer && <div className="border-t border-line px-6 py-3 text-center">{footer}</div>}
    </section>
  );
}

export function PlainCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-[var(--shadow-card)]">
      <h2 className="text-[19px] font-extrabold text-navy-900">{title}</h2>
      {subtitle && <p className="mt-0.5 text-[12.5px] text-mist">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Big number + label. `money` renders ₪, and 0 shows as "–" like a real portal. */
export function Stat({
  value,
  label,
  hint,
  big = false,
  money = false,
}: {
  value: number | string;
  label: string;
  hint?: string;
  big?: boolean;
  money?: boolean;
}) {
  const empty = value === 0 || value === "" || value === null || value === undefined;
  const shown = empty ? "–" : money ? ILS(Number(value)) : String(value);
  return (
    <div className="text-center">
      <div
        className={
          (big ? "text-[52px] " : "text-[34px] ") +
          "font-extrabold leading-none " +
          (empty ? "text-mist" : "text-navy-900")
        }
      >
        {shown}
      </div>
      <div className="mt-2 text-[14px] font-semibold text-ink-soft">{label}</div>
      {hint && <div className="text-[11.5px] leading-tight text-mist">{hint}</div>}
    </div>
  );
}

/** "איך זה עובד" — numbered steps on mint. */
export function Steps({ title, steps }: { title: string; steps: ReactNode[] }) {
  return (
    <section className="rounded-2xl bg-mint p-6">
      <h2 className="mb-5 text-right text-[19px] font-extrabold text-navy-900">{title}</h2>
      <ol className="space-y-4">
        {steps.map((s, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy text-[14px] font-extrabold text-white">
              {i + 1}
            </span>
            <p className="pt-1 text-[14px] leading-relaxed text-navy-900">{s}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * Earnings bar chart. Pure SVG, no deps. When every month is 0 it renders a flat
 * baseline and says so — it never draws an imaginary trend.
 */
export function EarningsChart({ data }: { data: MonthPoint[] }) {
  const max = Math.max(...data.map((d) => d.value), 0);
  const H = 150;

  // Nothing earned yet: a tall skeleton of 2px bars just leaves a big hole in the
  // card, so show a compact baseline + one honest line instead.
  if (max === 0) {
    return (
      <div className="py-2">
        <div className="flex items-end justify-between gap-3">
          {data.map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[12px] text-mist">₪0</span>
              <div className="h-[3px] w-full rounded-full bg-line" />
              <span className="text-[12px] text-mist">{d.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-[13px] text-mist">
          עדיין אין רווח חודשי — הגרף יתמלא כשלקוח שהפניתם יהפוך לפעיל.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[190px] items-end justify-between gap-3">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-[12px] font-bold text-navy-900">{ILS(d.value)}</span>
          <div
            className="w-full rounded-t-md bg-mint"
            style={{ height: Math.max(3, Math.round((d.value / max) * H)) }}
          />
          <span className="text-[12px] text-mist">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
