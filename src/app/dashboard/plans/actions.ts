"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PLAN_FEE } from "@/lib/types";

/**
 * Registers the user's plan choice. There is no card processing yet — this only
 * records the selection as 'trialing'; billing is completed manually by us.
 *
 * Goes through the select_plan() SECURITY DEFINER function because it also has to
 * write the referring partner's commission row, which RLS (correctly) won't let the
 * customer touch.
 */
export async function selectPlan(plan: string): Promise<{ error?: string }> {
  const monthly_fee = PLAN_FEE[plan];
  if (monthly_fee === undefined) return { error: "מסלול לא מוכר." };

  // Paid plans must go through card checkout — never granted for free here. The
  // SQL guard in select_plan() enforces this too; this is the first line.
  if (monthly_fee > 0) return { error: "המסלול הזה מחייב תשלום — יש לעבור דרך דף הסליקה." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "צריך להתחבר כדי לבחור מסלול." };

  const { error } = await supabase.rpc("select_plan", { p_plan: plan, p_fee: monthly_fee });
  if (error) return { error: "לא הצלחנו לשמור את המסלול כרגע. נסו שוב בעוד רגע." };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/plans");
  return {};
}
