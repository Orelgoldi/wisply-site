import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClearingPage } from "@/lib/invoice4u";
import { siteUrl } from "@/lib/site";
import { PLAN_FEE } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Start a purchase: create a pending order for the logged-in user, ask Invoice4U
 * for a hosted payment page, and return its URL for the client to redirect to.
 *
 * The amount comes from PLAN_FEE on the SERVER — never from the request body — and
 * the callback re-checks the charged amount against the stored order, so the price
 * cannot be tampered with from the browser.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const plan = typeof body?.plan === "string" ? body.plan : "";

    const amount = PLAN_FEE[plan];
    if (amount === undefined) {
      return NextResponse.json({ error: "מסלול לא מוכר." }, { status: 400 });
    }
    // Spark is free — nothing to charge; the plans action handles that path.
    if (amount <= 0) {
      return NextResponse.json({ error: "המסלול הזה אינו דורש תשלום." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "צריך להתחבר." }, { status: 401 });

    // Pending order. The RPC derives the amount itself from plan_fee() — we do NOT
    // pass it, so a caller hitting the RPC directly can't set their own price.
    const { data: orderId, error: orderErr } = await supabase.rpc("create_payment_order", {
      p_plan: plan,
    });
    if (orderErr || !orderId) {
      console.error("[checkout] create_payment_order failed:", orderErr);
      return NextResponse.json({ error: "לא הצלחנו לפתוח תשלום כרגע." }, { status: 500 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle<{ full_name: string | null }>();

    const result = await createClearingPage({
      sum: amount,
      description: `Wisply — מסלול ${plan}`,
      orderId: String(orderId),
      returnUrl: `${siteUrl()}/dashboard?paid=1`,
      callbackUrl: `${siteUrl()}/api/payment/callback`,
      fullName: profile?.full_name ?? "",
      email: user.email ?? "",
    });

    if (!result.ok || !result.redirectUrl || !result.paymentId) {
      console.error("[checkout] Invoice4U error:", result.errors);
      return NextResponse.json({ error: "שירות התשלומים לא זמין כרגע." }, { status: 502 });
    }

    // Bind this order to the PaymentId Invoice4U just allocated. The eventual charge
    // carries the same id, so the callback can find THIS order by it — no need to
    // trust the (public) callback body. Service-role, because clients can't write orders.
    const { error: bindErr } = await createAdminClient()
      .from("payment_orders")
      .update({ payment_id: result.paymentId })
      .eq("id", orderId);
    if (bindErr) {
      console.error("[checkout] could not bind payment id:", bindErr);
      return NextResponse.json({ error: "לא הצלחנו לפתוח תשלום כרגע." }, { status: 500 });
    }

    return NextResponse.json({ redirectUrl: result.redirectUrl });
  } catch (e) {
    console.error("[checkout]", e);
    return NextResponse.json({ error: "שגיאה זמנית. נסו שוב." }, { status: 500 });
  }
}
