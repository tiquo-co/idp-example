import { signInWithTiquo, signOutOfTiquo } from "@/app/actions";

export function SignInButton({ label = "Sign in with Tiquo" }: { label?: string }) {
  return (
    <form action={signInWithTiquo}>
      <button
        type="submit"
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
      >
        {label}
      </button>
    </form>
  );
}

export function SignOutButton() {
  return (
    <form action={signOutOfTiquo}>
      <button
        type="submit"
        className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-card"
      >
        Sign out
      </button>
    </form>
  );
}
