import { signOut } from "@/app/auth/actions";

/** Subtle text button in the dashboard header. Posts straight to the signOut action. */
export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-[15px] font-semibold text-ink-soft transition-colors hover:text-brand-700"
      >
        יציאה
      </button>
    </form>
  );
}
