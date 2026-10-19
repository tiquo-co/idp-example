import { Suspense } from "react";

import { auth } from "@/auth";
import { SignInButton } from "@/components/auth-buttons";
import { PageLoading } from "@/components/page-loading";
import { ActiveMembershipBadge, MembershipClaimsList } from "@/components/membership-claims";

async function HomeContent() {
  const session = await auth();

  if (!session?.user || session.error) {
    return (
      <section className="space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            Sign in with your club account
          </h1>
          <p className="max-w-xl text-muted text-pretty">
            This example app uses Tiquo as its identity provider over OpenID Connect. Members sign in
            with a one-time code on Tiquo&apos;s branded sign-in page, and the app receives their
            customer profile and current memberships in the tokens.
          </p>
        </div>
        {session?.error && (
          <p role="alert" className="rounded-lg bg-warning-surface px-4 py-3 text-sm text-warning">
            Your session has ended. Please sign in again.
          </p>
        )}
        <SignInButton />
      </section>
    );
  }

  const tiquo = session.tiquo;
  const name =
    [tiquo?.givenName, tiquo?.familyName].filter(Boolean).join(" ") || session.user.name || session.user.email;

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Welcome, {name}</h1>
          <p className="text-muted">{session.user.email}</p>
        </div>
        <ActiveMembershipBadge active={tiquo?.hasActiveMembership ?? false} />
      </div>

      <dl className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-card p-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted">Customer number</dt>
          <dd className="mt-1 font-mono break-all">{tiquo?.customerNumber ?? "None"}</dd>
        </div>
        <div>
          <dt className="text-muted">Customer ID</dt>
          <dd className="mt-1 font-mono break-all">{tiquo?.customerId ?? "None"}</dd>
        </div>
        <div>
          <dt className="text-muted">Organisation</dt>
          <dd className="mt-1 font-mono break-all">{tiquo?.organizationId ?? "None"}</dd>
        </div>
      </dl>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Current memberships (from the token)</h2>
        <p className="text-sm text-muted text-pretty">
          Read from the <code className="font-mono">memberships</code> and{" "}
          <code className="font-mono">has_active_membership</code> claims. They are refreshed with the
          access token every hour, so a cancelled membership disappears without a new sign-in.
        </p>
        <MembershipClaimsList memberships={tiquo?.memberships ?? []} />
      </div>

      <details className="rounded-xl border border-border bg-card p-4 text-sm">
        <summary className="cursor-pointer font-medium">Tiquo claims in this session</summary>
        <pre className="mt-3 overflow-x-auto font-mono text-xs">{JSON.stringify(tiquo, null, 2)}</pre>
      </details>
    </section>
  );
}

// The page depends on the session, so it streams in behind a boundary.
export default function Home() {
  return (
    <Suspense fallback={<PageLoading />}>
      <HomeContent />
    </Suspense>
  );
}
