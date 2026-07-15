import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MintCard, PlainCard, Stat, Steps } from "@/components/dash/Cards";
import { CopyField } from "../partner/CopyField";

type LicenseStatus = "active" | "suspended" | "canceled";

/** Mirrors the `licenses` table. */
type License = {
  id: string;
  key: string;
  user_id: string;
  plan: string | null;
  status: LicenseStatus;
  sites_limit: number | null;
  created_at: string;
  expires_at: string | null;
};

/** Mirrors the `license_activations` table. */
type LicenseActivation = {
  id: string;
  license_id: string;
  site_url: string;
  activated_at: string | null;
  last_seen_at: string | null;
};

const PLAN_LABEL: Record<string, string> = {
  spark: "Spark ✨",
  lite: "Lite",
  business: "Business",
  pro: "Pro",
  enterprise: "Enterprise",
};

const LIC_STATUS: Record<LicenseStatus, { label: string; pill: string }> = {
  active: { label: "פעיל", pill: "bg-mint/30 text-mint-700" },
  suspended: { label: "מושהה", pill: "bg-accent/10 text-accent-600" },
  canceled: { label: "בוטל", pill: "bg-accent/10 text-accent-600" },
};

/** Unknown values render as an en-dash: `Stat` already does that for "". */
const UNKNOWN = "";

function heDate(value: string | null | undefined) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("he-IL");
}

export default async function LicensePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: licence } = await supabase
    .from("licenses")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<License>();

  // Only fetch activations once we know there is a licence to hang them on.
  let activations: LicenseActivation[] | null = null;
  if (licence) {
    const { data } = await supabase
      .from("license_activations")
      .select("*")
      .eq("license_id", licence.id);
    activations = (data as LicenseActivation[]) ?? null;
  }

  if (!licence) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-[30px] font-extrabold text-navy-900">הרישיון שלי</h1>
          <p className="mt-1 text-[15px] text-ink-soft">מפתח הרישיון מפעיל את התוסף באתר שלכם.</p>
        </div>

        <PlainCard title="עדיין אין לכם רישיון">
          <p className="text-[14.5px] leading-relaxed text-ink-soft">
            מפתח הרישיון מונפק אוטומטית ברגע שבוחרים מסלול. הוא מה שמפעיל את התוסף באתר שלכם ומה
            שמביא לכם את העדכונים — בלי להתקין זיפים ידנית.
          </p>
          <Link
            href="/dashboard/plans"
            className="mt-5 inline-block rounded-full bg-navy px-6 py-2.5 text-[15px] font-bold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            בחירת מסלול
          </Link>
        </PlainCard>
      </div>
    );
  }

  const status = LIC_STATUS[licence.status];
  const used = activations ? activations.length : null;
  const limit = licence.sites_limit ?? null;
  const sites = used === null || limit === null ? UNKNOWN : `${used} / ${limit}`;
  const expires = heDate(licence.expires_at);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[30px] font-extrabold text-navy-900">הרישיון שלי</h1>
        <p className="mt-1 text-[15px] text-ink-soft">מפתח הרישיון מפעיל את התוסף באתר שלכם.</p>
      </div>

      <MintCard title="הרישיון שלי" subtitle={expires ? `בתוקף עד ${expires}` : undefined}>
        <CopyField label="מפתח הרישיון" value={licence.key} />

        <div className="mt-7 grid grid-cols-3 items-center gap-4 border-t border-line pt-6">
          <div className="text-center">
            <span
              className={`inline-block rounded-full px-3 py-1.5 text-[13px] font-bold ${
                status ? status.pill : "bg-shell text-mist"
              }`}
            >
              {status ? status.label : licence.status}
            </span>
            <div className="mt-2 text-[14px] font-semibold text-ink-soft">סטטוס</div>
          </div>

          <Stat value={sites} label="אתרים בשימוש" />

          <Stat value={licence.plan ? PLAN_LABEL[licence.plan] ?? licence.plan : UNKNOWN} label="המסלול שלי" />
        </div>
      </MintCard>

      <PlainCard title="האתרים שלי" subtitle="האתרים שבהם הרישיון הזה מופעל">
        {activations && activations.length > 0 ? (
          <ul className="divide-y divide-line">
            {activations.map((a) => {
              const activated = heDate(a.activated_at);
              const seen = heDate(a.last_seen_at);
              return (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                  <span dir="ltr" className="text-[15px] font-bold text-navy-900">
                    {a.site_url}
                  </span>
                  <span className="text-[12.5px] text-mist">
                    {activated && <>הופעל בתאריך {activated}</>}
                    {activated && seen && " · "}
                    {seen && <>נראה לאחרונה {seen}</>}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-[14px] text-ink-soft">עדיין לא הופעל באף אתר.</p>
        )}
      </PlainCard>

      <Steps
        title="איך מפעילים"
        steps={[
          <>העתיקו את המפתח.</>,
          <>
            בוורדפרס: <b>Wisply → הגדרות → מתקדם → רישיון</b>, הדביקו ושמרו.
          </>,
          <>מעכשיו עדכונים יגיעו אוטומטית — בלי להעלות זיפים ידנית.</>,
        ]}
      />
    </div>
  );
}
