"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/site";

/** Shape returned to the forms via useActionState. */
export type AuthState = {
  error?: string;
  /** Non-error message (e.g. "confirm your email") shown in a neutral tone. */
  notice?: string;
};

/** Turn Supabase's English auth errors into something a Hebrew user can act on. */
function hebrewAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "אימייל או סיסמה שגויים.";
  if (m.includes("email not confirmed")) return "האימייל עדיין לא אומת. בדקו את תיבת הדואר שלכם.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "כתובת האימייל הזו כבר רשומה. אפשר להתחבר איתה.";
  if (m.includes("password should be at least") || m.includes("password is too short"))
    return "הסיסמה קצרה מדי — לפחות 6 תווים.";
  if (m.includes("weak password") || m.includes("password is too weak"))
    return "הסיסמה חלשה מדי. נסו סיסמה ארוכה יותר עם מספרים או סימנים.";
  if (m.includes("unable to validate email address") || m.includes("invalid email"))
    return "כתובת האימייל לא תקינה.";
  if (m.includes("rate limit") || m.includes("too many requests"))
    return "יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.";
  if (m.includes("signups not allowed") || m.includes("signup is disabled"))
    return "ההרשמה סגורה כרגע. נסו שוב מאוחר יותר.";
  return "משהו השתבש. נסו שוב.";
}

export async function signIn(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "צריך למלא אימייל וסיסמה." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: hebrewAuthError(error.message) };

  redirect("/dashboard");
}

export async function signUp(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const full_name = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const site_url = String(formData.get("site_url") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  // Partner referral code, carried in from /signup?ref=CODE.
  const ref = String(formData.get("ref") ?? "").trim();

  if (!full_name || !email || !password) return { error: "צריך למלא שם, אימייל וסיסמה." };
  if (password.length < 6) return { error: "הסיסמה קצרה מדי — לפחות 6 תווים." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // The on_auth_user_created trigger copies full_name + site_url into profiles.
      // ref_code stays in raw_user_meta_data so the attribution survives until claimed.
      data: {
        full_name,
        site_url: site_url || null,
        ...(ref ? { ref_code: ref } : {}),
      },
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  });

  if (error) return { error: hebrewAuthError(error.message) };

  // When email confirmation is on, signUp returns no session — redirecting to
  // /dashboard would just bounce back to /login with no explanation.
  if (!data.session) {
    return { notice: "שלחנו לכם מייל אימות. אשרו אותו כדי להיכנס לחשבון." };
  }

  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
