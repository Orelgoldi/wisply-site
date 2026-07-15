"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** null = success. */
export type ActionResult = { error: string } | null;

/**
 * Opens a partner account for the signed-in user.
 *
 * The codes, the insert and the role flip all happen inside the join_partner()
 * SECURITY DEFINER function: clients have no write grant on `partners` and cannot
 * set `profiles.role` themselves (otherwise anyone could grant themselves 'admin').
 */
export async function joinPartner(): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "צריך להתחבר כדי להצטרף לתוכנית השותפים." };

  const { error } = await supabase.rpc("join_partner");
  if (error) return { error: "לא הצלחנו לפתוח חשבון שותף כרגע. נסו שוב בעוד רגע." };

  revalidatePath("/dashboard/partner");
  revalidatePath("/dashboard");
  return null;
}

/**
 * Requests the certified tier — it does NOT grant it.
 *
 * Certification doubles the partner's own commission (25%/15% → 50%/25%) and carries
 * an obligation (installs + training), so it is approved by us, not self-served.
 */
export async function requestCertification(): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "צריך להתחבר כדי לשלוח בקשה." };

  const { error } = await supabase.rpc("request_certification");
  if (error) return { error: "שליחת הבקשה נכשלה. נסו שוב בעוד רגע." };

  revalidatePath("/dashboard/partner");
  return null;
}
