import { Lock, Sparkles, UserRound } from "lucide-react";
import { Suspense } from "react";

import { SignInButton } from "@/components/auth-buttons";
import { MembershipClaimsList } from "@/components/membership-claims";
import { PageLoading } from "@/components/page-loading";
import { Notice } from "@/components/signed-out-notice";
import { Card, Eyebrow, rise } from "@/components/ui";
import { getSignedInSession } from "@/lib/session";

// A members-only area. Access is decided on the server from the
// has_active_membership claim, which every token refresh re-reads from Tiquo.
// A HubSpot membership with an unpaid invoice stays active until HubSpot
// marks it cancelled.
async function MembersPageContent() {
  const session = await getSignedInSession();

  if (!session) {
    return (
      <Notice icon={UserRound} title="Members area" action={<SignInButton />}>
        Sign in with your club account to see the members area.
      </Notice>
    );
  }

  if (!session.tiquo?.hasActiveMembership) {
    return (
      <Notice icon={Lock} title="Members only" tone="warning">
        This area is for members with an active membership. Your account has no active membership at the
        moment.
      </Notice>
    );
  }

  return (
    <div className="space-y-8">
      <Card {...rise(0)} className="rise relative overflow-hidden p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_16rem_at_100%_0%,var(--brand-soft),transparent_70%)]"
        />
        <div className="relative space-y-3">
          <Eyebrow>Members area</Eyebrow>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight text-balance">
            Welcome in
            <Sparkles aria-hidden="true" className="size-6 text-brand" />
          </h1>
          <p className="max-w-xl text-muted text-pretty">
            You can see this because your token says <code className="font-mono text-foreground">has_active_membership: true</code>.
          </p>
        </div>
      </Card>
      <section {...rise(1)} className="rise space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Your memberships</h2>
        <MembershipClaimsList memberships={session.tiquo.memberships} />
      </section>
    </div>
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
