import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyDownloadToken } from "@/lib/download-token";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Streams the current release zip. Unlike the JSON endpoints this one is fetched
 * by the WP updater expecting a binary body, so failures are plain-text status
 * codes rather than JSON.
 *
 * Two gates, both required:
 *   1. a token this server signed, still within its TTL (issued by /api/update)
 *   2. a LIVE licence check — a token minted 40 hours ago must not outlive a
 *      licence revoked 10 minutes ago.
 */
function deny(message: string, status: number) {
  return new NextResponse(message, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("t")?.trim() ?? "";
    if (!token) return deny("Missing download token", 403);

    const payload = verifyDownloadToken(token);
    if (!payload) return deny("Expired or invalid download token", 403);

    const { key, site } = payload;

    // 1. Live licence gate — anon client, since license_check is the public RPC.
    const supabase = await createClient();
    const { data: license, error: licenseError } = await supabase.rpc("license_check", {
      p_key: key,
      p_site: site,
    });
    if (licenseError || !license || (license as { ok?: boolean }).ok !== true) {
      return deny("Invalid or inactive license", 403);
    }

    // 2. Current release + the zip itself, from the PRIVATE bucket.
    const admin = createAdminClient();

    const { data: release, error: releaseError } = await admin
      .from("releases")
      .select("*")
      .eq("is_current", true)
      .order("released_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (releaseError || !release?.zip_path) return deny("No release available", 404);

    const { data: blob, error: storageError } = await admin.storage
      .from("releases")
      .download(release.zip_path);
    if (storageError || !blob) return deny("Release file not found", 404);

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="wisply-chatbot.zip"',
        "Content-Length": String(blob.size),
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    // createAdminClient() and the token secret both throw when unset; a silent 403
    // here would read as "your licence is bad" when the truth is "we misdeployed".
    console.error("[wisply/download]", e);
    return deny("Temporary error", 403);
  }
}
