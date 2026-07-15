"use client";

import { useState } from "react";

/** Read-only value + click-to-copy. Value is always LTR (links / codes). */
export function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context / no permission) — the field stays selectable.
    }
  }

  return (
    <label className="block">
      <span className="mb-1.5 block text-[14px] font-semibold text-ink">{label}</span>
      <div className="flex items-center gap-2">
        <input
          readOnly
          dir="ltr"
          value={value}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full min-w-0 rounded-xl border border-line bg-cloud px-4 py-3 text-[14.5px] text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-full bg-brand-700 px-5 py-2.5 text-[15px] font-bold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {copied ? "הועתק ✓" : "העתקה"}
        </button>
      </div>
    </label>
  );
}
