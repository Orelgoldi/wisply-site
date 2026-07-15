"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { ILS } from "@/lib/types";

export type NavItem = { href: string; label: string; icon: keyof typeof ICONS };

export function Sidebar({
  name,
  badge,
  balance,
  balanceNote,
  ctaLabel,
  ctaHref,
  items,
}: {
  name: string;
  badge: string;
  balance: number;
  balanceNote: string;
  ctaLabel: string;
  ctaHref: string;
  items: NavItem[];
}) {
  const path = usePathname();
  const initials = name.trim().slice(0, 1).toUpperCase() || "W";

  return (
    <aside className="sticky top-0 flex h-screen w-[264px] shrink-0 flex-col bg-navy text-white">
      {/* identity */}
      <div className="px-6 pt-7 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/10 text-2xl font-extrabold ring-2 ring-white/15">
          {initials}
        </div>
        <div className="mt-3 text-[11px] font-bold tracking-[0.14em] text-mint">{badge}</div>
        <div className="mt-1 text-[22px] font-extrabold leading-tight">היי {name}</div>
        <div className="mt-1 text-[12px] leading-snug text-white/50">{balanceNote}</div>

        <div className="mt-3 text-[40px] font-extrabold leading-none text-mint">
          {ILS(balance)}
        </div>
        <div className="text-[12px] text-white/50">+ מע״מ</div>

        <Link
          href={ctaHref}
          className="mt-5 block rounded-full border border-white/25 px-4 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-white/10"
        >
          + {ctaLabel}
        </Link>
      </div>

      {/* nav */}
      <nav className="mt-7 flex-1 overflow-y-auto px-3 pb-6">
        {items.map((it) => {
          const active = path === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={clsx(
                "mb-0.5 flex items-center justify-end gap-3 rounded-xl px-4 py-2.5 text-[14.5px] transition-colors",
                active ? "bg-white/10 font-bold text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <span>{it.label}</span>
              <span className={clsx("shrink-0", active ? "text-mint" : "text-white/50")}>{ICONS[it.icon]}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

const s = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const ICONS = {
  grid: (
    <svg width="18" height="18" viewBox="0 0 24 24" {...s}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  wallet: (
    <svg width="18" height="18" viewBox="0 0 24 24" {...s}>
      <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4M3 7h16" />
      <circle cx="17" cy="13" r="1.4" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" {...s}>
      <circle cx="9" cy="8" r="3.2" /><path d="M3 20a6 6 0 0 1 12 0M16 5.5a3.2 3.2 0 0 1 0 6M18 20a5.6 5.6 0 0 0-3-5" />
    </svg>
  ),
  calc: (
    <svg width="18" height="18" viewBox="0 0 24 24" {...s}>
      <rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" />
    </svg>
  ),
  bolt: (
    <svg width="18" height="18" viewBox="0 0 24 24" {...s}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </svg>
  ),
  user: (
    <svg width="18" height="18" viewBox="0 0 24 24" {...s}>
      <circle cx="12" cy="8" r="3.5" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  ),
};
