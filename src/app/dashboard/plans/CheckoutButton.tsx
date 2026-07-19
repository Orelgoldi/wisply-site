"use client";

import { useState } from "react";

/**
 * Starts an Invoice4U checkout: asks the server for a hosted payment page and
 * sends the customer there. The amount is decided server-side from the plan id.
 */
export function CheckoutButton({ plan, accent }: { plan: string; accent?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.redirectUrl) {
        setErr(data?.error ?? "לא הצלחנו לפתוח את דף התשלום. נסו שוב.");
        setLoading(false);
        return;
      }
      window.location.href = data.redirectUrl as string;
    } catch {
      setErr("שגיאה זמנית. נסו שוב.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={go}
        disabled={loading}
        className={`w-full rounded-full py-2.5 text-center text-[15px] font-bold transition-transform hover:-translate-y-0.5 disabled:opacity-60 ${
          accent ? "bg-accent text-white" : "bg-brand-700 text-white"
        }`}
      >
        {loading ? "רגע…" : "מעבר לתשלום"}
      </button>
      {err && <p className="mt-2 text-center text-[13px] font-semibold text-accent">{err}</p>}
    </div>
  );
}
