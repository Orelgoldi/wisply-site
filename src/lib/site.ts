/**
 * Absolute site origin. A relative referral link is worthless (it is meant to be
 * copied and shared), so fall back to the Vercel URL and finally to localhost
 * rather than emitting "" or the string "undefined".
 */
export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "") ||
    "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}
