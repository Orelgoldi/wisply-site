import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar, type NavItem } from "@/components/dash/Sidebar";
import { SignOutButton } from "@/components/SignOutButton";
import { computeStats } from "@/lib/partner-data";
import type { Partner, Profile, Referral } from "@/lib/types";
import { RATES } from "@/lib/types";
import { Logo } from "@/components/Logo";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: partner }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>(),
    supabase.from("partners").select("*").eq("user_id", user.id).maybeSingle<Partner>(),
  ]);

  let stats = { earnedMonthly: 0 };
  if (partner) {
    const { data } = await supabase.from("referrals").select("*").eq("partner_id", partner.id);
    stats = computeStats((data as Referral[]) ?? []);
  }

  const firstName = (profile?.full_name || user.email || "").split(" ")[0] || "שותף";

  const items: NavItem[] = partner
    ? [
        { href: "/dashboard", label: "דשבורד", icon: "grid" },
        { href: "/dashboard/partner", label: "פורטל שותפים", icon: "users" },
        { href: "/dashboard/plans", label: "מסלולים", icon: "wallet" },
      ]
    : [
        { href: "/dashboard", label: "דשבורד", icon: "grid" },
        { href: "/dashboard/plans", label: "מסלולים", icon: "wallet" },
        { href: "/dashboard/partner", label: "הצטרפות כשותף", icon: "bolt" },
      ];

  return (
    <div className="flex min-h-screen bg-shell" dir="rtl">
      <Sidebar
        name={firstName}
        badge={partner ? RATES[partner.tier].label.toUpperCase() : "WISPLY"}
        balance={partner ? stats.earnedMonthly : 0}
        balanceNote={
          partner
            ? stats.earnedMonthly > 0
              ? "רווח חודשי מלקוחות פעילים"
              : "אין עדיין רווח חודשי מלקוחות פעילים"
            : "הצטרפו לתוכנית השותפים כדי להתחיל להרוויח"
        }
        ctaLabel={partner ? "צרפו לקוח חדש" : "הצטרפות כשותף"}
        ctaHref="/dashboard/partner"
        items={items}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-line bg-white px-7">
          <Link href="/"><Logo /></Link>
          <SignOutButton />
        </header>
        <main className="flex-1 p-7">{children}</main>
      </div>
    </div>
  );
}
