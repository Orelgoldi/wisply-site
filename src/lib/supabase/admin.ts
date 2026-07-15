import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client. Bypasses RLS entirely — never import this from a component,
 * an action, or anything a browser can reach. It exists for exactly two callers:
 * /api/update and /api/download, which must read `releases` and pull the product zip
 * out of a PRIVATE Storage bucket on behalf of a caller who has no session (a
 * WordPress site holding only a licence key).
 *
 * The alternative — opening the bucket and the table to `anon` — would hand the zip
 * to anyone with the publishable key and make the licence check decorative.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    // Thrown at request time, not build time: a missing key must fail the one
    // endpoint that needs it, loudly, rather than break the whole deploy.
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set — /api/update and /api/download cannot serve releases."
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
