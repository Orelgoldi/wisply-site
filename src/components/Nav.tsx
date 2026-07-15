"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const links = [
  { href: "#features", label: "יכולות" },
  { href: "#who", label: "למי מתאים" },
  { href: "#pricing", label: "מחירים" },
  { href: "#partners", label: "שותפים" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cloud/85 backdrop-blur-md border-b border-line shadow-[0_2px_20px_-12px_rgba(11,31,36,0.2)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#top" className="shrink-0">
          <Logo />
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[15px] font-medium text-ink-soft transition-colors hover:text-brand-700"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="hidden text-[15px] font-semibold text-ink-soft transition-colors hover:text-brand-700 sm:block"
          >
            כניסה
          </a>
          <a
            href="#pricing"
            className="rounded-full bg-brand-700 px-5 py-2.5 text-[15px] font-bold text-white shadow-[0_8px_24px_-8px_rgba(0,122,124,0.6)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            התחילו עכשיו
          </a>
        </div>
      </div>
    </header>
  );
}
