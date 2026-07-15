import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Soft failure — WordPress admin must never see a 5xx from us. */
const softError = () =>
  NextResponse.json({ ok: false, message: "שגיאה זמנית — נסו שוב" }, { status: 200 });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const key = body?.key;
    const site = body?.site;

    if (typeof key !== "string" || !key.trim() || typeof site !== "string" || !site.trim()) {
      return NextResponse.json(
        { ok: false, message: "חסר מפתח רישיון או כתובת אתר" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("license_deactivate", {
      p_key: key.trim(),
      p_site: site.trim(),
    });

    if (error) return softError();
    return NextResponse.json(data, { status: 200 });
  } catch {
    return softError();
  }
}
