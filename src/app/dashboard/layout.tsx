import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { SignOutButton } from "@/components/SignOutButton";
import type { Profile } from "@/lib/types";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  const isPartner = profile?.role === "partner";

  return (
    <div className="min-h-screen bg-cloud">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/"><Logo /></Link>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-[15px] font-semibold text-ink-soft hover:text-brand-700">
              האזור שלי
            </Link>
            <Link
              href="/dashboard/partner"
              className="text-[15px] font-semibold text-ink-soft hover:text-brand-700"
            >
              {isPartner ? "פורטל שותפים" : "הצטרפות כשותף"}
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
    </div>
  );
}
