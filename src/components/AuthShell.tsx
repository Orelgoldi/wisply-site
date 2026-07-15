import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./Logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* brand panel */}
      <div className="relative hidden overflow-hidden brand-gradient p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="blob" style={{ width: 360, height: 360, top: -120, left: -80, background: "#ffffff", opacity: 0.15 }} />
        <Link href="/" className="relative z-10 w-fit">
          <Logo tone="white" />
        </Link>
        <div className="relative z-10">
          <h2 className="max-w-sm text-3xl font-extrabold leading-tight">
            בוט אחד. יותר לקוחות. פחות עבודה.
          </h2>
          <p className="mt-4 max-w-sm text-white/80">
            נהלו את הבוט, הלידים והמנוי — הכל ממקום אחד.
          </p>
        </div>
        <div className="relative z-10 text-[13px] text-white/60">© {new Date().getFullYear()} Wisply</div>
      </div>

      {/* form panel */}
      <div className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 inline-block lg:hidden">
            <Logo />
          </Link>
          <h1 className="text-2xl font-extrabold text-ink">{title}</h1>
          <p className="mt-1.5 text-[15px] text-ink-soft">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-center text-[14px] text-ink-soft">{footer}</div>
        </div>
      </div>
    </main>
  );
}

export function Field({
  label,
  type = "text",
  placeholder,
  dir,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-[14px] font-semibold text-ink">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        dir={dir}
        className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-mist focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </label>
  );
}

export function SubmitButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="mt-2 w-full rounded-xl bg-brand-700 py-3.5 text-[16px] font-bold text-white shadow-[0_10px_24px_-10px_rgba(0,122,124,0.7)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
    >
      {children}
    </button>
  );
}
