"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClearingPage } from "@/lib/invoice4u";
import { siteUrl } from "@/lib/site";
import { PLAN_FEE } from "@/lib/types";

export type CheckoutState = { error?: string };

/**
 * New-customer checkout: create the account, then send them to pay for the chosen
 * plan in one flow. Email confirmation stays ON — the account is created unconfirmed
 * and the payment fulfils against it server-side (the callback uses service-role, no
 * session needed), so first login happens after the customer confirms their email.
 *
 * Existing users don't come through here — they buy from /dashboard/plans while
 * logged in. An already-registered email is bounced to /login.
 */
export async function startCheckout(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const plan = String(formData.get("plan") ?? "").trim();
  const full_name = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const site_url = String(formData.get("site_url") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const ref = String(formData.get("ref") ?? "").trim();

  // Explicit whitelist — a plan key like "__proto__" would slip past a PLAN_FEE
  // lookup (returns the prototype, not undefined) and reach account creation.
  const PAID_PLANS = ["lite", "business", "pro"];
  if (!PAID_PLANS.includes(plan)) {
    return { error: "המסלול הזה לא זמין לרכישה כאן." };
  }
  const amount = PLAN_FEE[plan]; // server-trusted; never from the client
  if (typeof amount !== "number" || amount <= 0) {
    return { error: "המסלול הזה לא זמין לרכישה כאן." };
  }
  if (!full_name || !email || !password) return { error: "צריך למלא שם, אימייל וסיסמה." };
  if (password.length < 6) return { error: "הסיסמה קצרה מדי — לפחות 6 תווים." };

  // 1) Create the account (unconfirmed; Supabase sends the confirmation email).
  const supabase = await createClient();
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        site_url: site_url || null,
        ...(ref ? { ref_code: ref } : {}),
      },
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  });

  if (signUpErr) {
    const m = signUpErr.message.toLowerCase();
    if (m.includes("password")) return { error: "הסיסמה חלשה מדי — נסו סיסמה ארוכה יותר." };
    if (m.includes("rate limit")) return { error: "יותר מדי ניסיונות. נסו שוב בעוד כמה דקות." };
    return { error: "לא הצלחנו ליצור את החשבון. נסו שוב." };
  }

  // Existing email: with confirmations on, Supabase does NOT error — it returns an
  // obfuscated user with an EMPTY identities array (anti-enumeration; the real account
  // is left untouched, verified against this project). Detecting it here is what stops
  // us attaching an order to a fake/foreign id and gives the customer the right nudge.
  const user = signUpData.user;
  if (!user || (user.identities?.length ?? 0) === 0) {
    return { error: "כתובת האימייל כבר רשומה. התחברו כדי לרכוש, או השתמשו במייל אחר." };
  }
  const userId = user.id;

  // 2) Create the pending order for this user. No session yet (confirmation on), so
  //    this goes through the service-role client; the amount is from PLAN_FEE, never
  //    the client.
  const admin = createAdminClient();
  const { data: order, error: orderErr } = await admin
    .from("payment_orders")
    .insert({ user_id: userId, plan, amount })
    .select("id")
    .single();
  if (orderErr || !order) {
    console.error("[checkout] order insert failed:", orderErr);
    return { error: "לא הצלחנו לפתוח תשלום כרגע. נסו שוב." };
  }

  // 3) Hosted payment page, bound to this order via the allocated PaymentId.
  const result = await createClearingPage({
    sum: amount,
    description: `Wisply — מסלול ${plan}`,
    orderId: order.id,
    returnUrl: `${siteUrl()}/welcome`,
    callbackUrl: `${siteUrl()}/api/payment/callback`,
    fullName: full_name,
    email,
    phone,
  });
  if (!result.ok || !result.redirectUrl || !result.paymentId) {
    console.error("[checkout] clearing page failed:", result.errors);
    return { error: "שירות התשלומים לא זמין כרגע. נסו שוב." };
  }

  const { error: bindErr } = await admin
    .from("payment_orders")
    .update({ payment_id: result.paymentId })
    .eq("id", order.id);
  if (bindErr) {
    console.error("[checkout] bind payment id failed:", bindErr);
    return { error: "לא הצלחנו לפתוח תשלום כרגע. נסו שוב." };
  }

  // 4) Off to enter card details on the hosted page.
  redirect(result.redirectUrl);
}
