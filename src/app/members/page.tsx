import { Suspense } from "react";

import { SignInButton } from "@/components/auth-buttons";
import { PageLoading } from "@/components/page-loading";
import { MembershipClaimsList } from "@/components/membership-claims";
import { getSignedInSession } from "@/lib/session";

// A members-only area. Access is decided on the server from the
// has_active_membership claim, which every token refresh re-reads from Tiquo.
// A HubSpot membership with an unpaid invoice stays active until HubSpot
// marks it cancelled.
async function MembersPageContent() {
  const session = await getSignedInSession();

  if (!session) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Members area</h1>
        <p className="text-muted">Sign in to see the members area.</p>
        <SignInButton />
      </section>
    );
  }

  if (!session.tiquo?.hasActiveMembership) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Members only</h1>
        <p className="max-w-xl text-muted text-pretty">
          This area is for members with an active membership. Your account has no active membership
          at the moment.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Members area</h1>
        <p className="text-muted">You&apos;re in: you have an active membership.</p>
      </div>
      <MembershipClaimsList memberships={session.tiquo.memberships} />
    </section>
  );
}

// The page depends on the session, so it streams in behind a boundary.
export default function MembersPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <MembersPageContent />
    </Suspense>
  );
}
