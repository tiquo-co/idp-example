import { ArrowRight, LogOut } from "lucide-react";

import { signInWithTiquo, signOutOfTiquo } from "@/app/actions";
import { buttonStyles } from "@/components/ui";

export function SignInButton({ label = "Sign in with Tiquo", compact = false }: { label?: string; compact?: boolean }) {
  return (
    <form action={signInWithTiquo}>
      <button type="submit" className={compact ? buttonStyles.secondary : buttonStyles.primary}>
        {label}
        {!compact && <ArrowRight aria-hidden="true" className="-mr-0.5 size-4" />}
      </button>
    </form>
  );
}

export function SignOutButton() {
  return (
    <form action={signOutOfTiquo}>
      <button type="submit" className={buttonStyles.secondary}>
        <LogOut aria-hidden="true" className="-ml-0.5 size-4" />
        Sign out
      </button>
    </form>
  );
}
