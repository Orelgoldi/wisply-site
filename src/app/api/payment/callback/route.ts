import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPayment } from "@/lib/invoice4u";

export const dynamic = "force-dynamic";

/**
 * Invoice4U server-to-server notification. This endpoint is PUBLIC — anyone can
 * POST to it — so the body is treated as an untrusted hint, never as proof. We
 * take only the OrderIdClientUsage and PaymentId from it, then re-query Invoice4U's
 * clearing log ourselves to confirm the charge happened, for how much, AND that it
 * was made against THIS order (a real charge must not be replayable onto another
 * order of the same price). Only then does anything money-gated run.
 *
 * Status codes are deliberate: 200 means "resolved, do not retry"; 5xx means
 * "we couldn't finish, please retry" — so a genuinely paid order is never left
 * stuck pending because our verify call blipped.
 */
export async function POST(req: NextRequest) {
  let orderId = "";
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

    orderId = String(payload.OrderIdClientUsage ?? "").trim();
    paymentId = String(payload.PaymentId ?? "").trim();

    // Malformed/irrelevant call — nothing to retry.
    if (!orderId || !paymentId) {
      console.error("[payment/callback] missing order/payment id", { orderId, paymentId });
      return NextResponse.json({ ok: true, reason: "missing_ids" });
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
      console.error("[payment/callback] payment not confirmed yet", { orderId, paymentId });
      return NextResponse.json({ ok: false, reason: "unconfirmed" }, { status: 500 });
    }
    if (!v.isSuccess) {
      return NextResponse.json({ ok: true, reason: "not_success" });
    }

    // Bind the charge to the order it was actually made against, using the order id
    // FROM OUR VERIFIED re-query — never the client-supplied one. An empty verified
    // order id means we can't bind, so we refuse (fail closed). This is what stops a
    // real charge from being replayed onto a different same-price order.
    if (!v.orderId || v.orderId !== orderId) {
      console.error("[payment/callback] order binding failed", { claimed: orderId, verified: v.orderId });
      return NextResponse.json({ ok: true, reason: "order_mismatch" });
    }

    // Amount must be a real number here; fulfill_payment fails closed on null too.
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("fulfill_payment", {
      p_order_id: v.orderId,
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
    console.error("[payment/callback]", { orderId, paymentId, err: String(e) });
    return NextResponse.json({ ok: false, reason: "transient" }, { status: 500 });
  }
}
