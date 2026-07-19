import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPayment } from "@/lib/invoice4u";

export const dynamic = "force-dynamic";

/**
 * Invoice4U server-to-server notification. This endpoint is PUBLIC — anyone can
 * POST to it — so the body is an untrusted hint, never proof. We take only the
 * PaymentId from it, re-query Invoice4U's clearing log ourselves to confirm the
 * charge succeeded and for how much, then fulfil the order we bound to that
 * PaymentId at checkout. A charge can't be replayed onto a different order because
 * a PaymentId matches exactly one order (the one we stored it on), and a stranger's
 * PaymentId matches none. Only then does anything money-gated run.
 *
 * Status codes are deliberate: 200 means "resolved, do not retry"; 5xx means
 * "we couldn't finish, please retry" — so a genuinely paid order is never left
 * stuck pending because our verify call blipped.
 */
export async function POST(req: NextRequest) {
  let paymentId = "";
  try {
    let payload: Record<string, unknown> = {};
    const ct = req.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      payload = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    } else {
      const form = await req.formData();
      const raw = form.get("Data");
      if (typeof raw === "string") {
        try {
          payload = JSON.parse(raw);
        } catch {
          payload = {};
        }
      }
    }

    // Only the PaymentId is taken from the body — the order is resolved server-side
    // from it. The body's OrderIdClientUsage is ignored (untrusted, and anyway the
    // clearing log doesn't echo it back for us to check against).
    paymentId = String(payload.PaymentId ?? "").trim();

    if (!paymentId) {
      console.error("[payment/callback] missing payment id");
      return NextResponse.json({ ok: true, reason: "missing_id" });
    }

    // INDEPENDENT verification. Throwing here (Invoice4U down) drops to the catch
    // → 5xx → Invoice4U retries. That is intentional: a paid order must not be
    // abandoned because verification momentarily failed.
    const v = await verifyPayment(paymentId);

    // Could not confirm the charge. The query only returns SUCCESSFUL logs, so a
    // miss is either a genuine non-success or the charge isn't visible in the log
    // yet (replication lag right after payment). We can't tell them apart, and
    // losing a real paid order is the worse failure — so retry (500) rather than
    // give up. A forged callback lands here too and simply gets a 500 with nothing
    // fulfilled.
    if (!v) {
      console.error("[payment/callback] payment not confirmed yet", { paymentId });
      return NextResponse.json({ ok: false, reason: "unconfirmed" }, { status: 500 });
    }
    if (!v.isSuccess) {
      return NextResponse.json({ ok: true, reason: "not_success" });
    }

    // Bind purely on the PaymentId we stored on the order at checkout — the order id
    // in the (public) callback body is not trusted or even used. fulfill_payment looks
    // the order up by this PaymentId; a stranger's/guessed id matches no order of ours,
    // so a replayed charge can never fulfil anything. (The clearing log doesn't echo
    // OrderIdClientUsage, so this checkout-time binding is the sound way to do it.)
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("fulfill_payment", {
      p_payment_id: paymentId,
      p_amount: v.amount,
    });

    if (error) {
      // A DB error is transient from our side — let Invoice4U retry.
      console.error("[payment/callback] fulfill_payment errored:", error);
      return NextResponse.json({ ok: false, reason: "fulfil_error" }, { status: 500 });
    }

    const res = data as { ok?: boolean; reason?: string };
    if (!res?.ok) {
      // A definitive rejection (amount_mismatch, payment_already_used, …) — resolved,
      // don't retry.
      console.error("[payment/callback] fulfil rejected:", res);
      return NextResponse.json({ ok: true, reason: res?.reason ?? "rejected" });
    }

    return NextResponse.json({ ok: true, reason: res.reason });
  } catch (e) {
    // Transient (verify threw, parse failed mid-flight): 5xx so it retries.
    console.error("[payment/callback]", { paymentId, err: String(e) });
    return NextResponse.json({ ok: false, reason: "transient" }, { status: 500 });
  }
}
