import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { signDownloadToken } from "@/lib/download-token";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * WordPress polls this on every update check. "No update" is the only safe
 * failure mode, so every problem (bad license, DB down, no release) returns
 * an empty object with status 200 — never an error the admin screen can trip on.
 */
const noUpdate = () => NextResponse.json({}, { status: 200 });

/**
 * Numeric semver-ish compare. Must NOT be a string compare:
 * "2.10.0" > "2.9.0" numerically, but "2.10.0" < "2.9.0" lexically.
 * Returns 1 if a > b, -1 if a < b, 0 if equal.
 */
function compareVersions(a: string, b: string): number {
  const pa = String(a).trim().split(".");
  const pb = String(b).trim().split(".");
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    // Strip any non-digit suffix ("2.6.0-beta1" -> 2, 6, 0); missing parts are 0.
    const na = parseInt(pa[i] ?? "0", 10);
    const nb = parseInt(pb[i] ?? "0", 10);
    const va = Number.isNaN(na) ? 0 : na;
    const vb = Number.isNaN(nb) ? 0 : nb;
    if (va > vb) return 1;
    if (va < vb) return -1;
  }
  return 0;
}

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const key = params.get("key")?.trim() ?? "";
    const site = params.get("site")?.trim() ?? "";
    const version = params.get("version")?.trim() ?? "";

    if (!key || !site || !version) return noUpdate();

    const supabase = await createClient();

    // 1. License gate.
    const { data: license, error: licenseError } = await supabase.rpc("license_check", {
      p_key: key,
      p_site: site,
    });
    if (licenseError || !license || (license as { ok?: boolean }).ok !== true) return noUpdate();

    // 2. Current release. `releases` is not readable by anon — the zip_path is a map
    //    to the artifact — so this reads with the service-role client.
    const { data: release, error: releaseError } = await createAdminClient()
      .from("releases")
      .select("*")
      .eq("is_current", true)
      .order("released_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (releaseError || !release?.version) {
      // Loud on purpose. "No update" is indistinguishable from "you're up to date"
      // to the caller, so a misconfigured deploy would silently serve nothing to
      // every install with a wall of healthy 200s in the logs.
      if (releaseError) console.error("[wisply/update] releases read failed:", releaseError);
      return noUpdate();
    }

    // 3. Only offer the update when the release is actually newer.
    if (compareVersions(release.version, version) <= 0) return noUpdate();

    // WordPress persists this URL in wp_options and we log it — so it carries an
    // opaque expiring token, not the customer's long-lived licence key.
    const token = signDownloadToken(key, site);
    const pkg = `${siteUrl()}/api/download?t=${encodeURIComponent(token)}`;

    return NextResponse.json(
      {
        version: release.version,
        package: pkg,
        changelog: release.changelog ?? "",
        requires: "6.0",
        tested: "6.7",
      },
      { status: 200 }
    );
  } catch (e) {
    // Reached when WISPLY_DOWNLOAD_SECRET or SUPABASE_SERVICE_ROLE_KEY is missing —
    // both throw. Without this line that misconfiguration looks exactly like "no
    // update available" and nothing anywhere would say otherwise.
    console.error("[wisply/update]", e);
    return noUpdate();
  }
}
