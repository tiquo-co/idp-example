import { CalendarDays, CircleAlert, CircleDashed, Layers } from "lucide-react";
import { Suspense } from "react";

import { SignInButton } from "@/components/auth-buttons";
import { SourcePill } from "@/components/membership-claims";
import { PageLoading } from "@/components/page-loading";
import { Notice } from "@/components/signed-out-notice";
import { Card, Eyebrow, Pill, rise } from "@/components/ui";
import { fetchTiquoMemberships, type TiquoApiMembership } from "@/lib/tiquo";
import { formatDate, getSignedInSession, humanize } from "@/lib/session";

function formatPrice(membership: TiquoApiMembership) {
  if (membership.price === undefined || !membership.currency) return null;
  const amount = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: membership.currency,
  }).format(membership.price / 100);
  return membership.billingPeriod ? `${amount} / ${humanize(membership.billingPeriod).toLowerCase()}` : amount;
}

function statusTone(membership: TiquoApiMembership) {
  if (membership.paymentStatus === "past_due") return "warning" as const;
  return membership.isCurrent ? ("success" as const) : ("neutral" as const);
}

// Calls the Tiquo customer API with the IDP access token. Unlike the token
// claims (current memberships only), the API returns every membership,
// including ended ones, with prices.
async function MembershipsPageContent() {
  const session = await getSignedInSession();
  if (!session?.accessToken) {
    return (
      <Notice icon={Layers} title="Memberships" action={<SignInButton />}>
        Sign in with your club account to see your memberships.
      </Notice>
    );
  }

  let memberships: TiquoApiMembership[] = [];
  let error: string | null = null;
  try {
    memberships = await fetchTiquoMemberships(session.accessToken);
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Could not load memberships.";
  }

  return (
    <div className="space-y-8">
      <header {...rise(0)} className="rise space-y-2">
        <Eyebrow>Customer API</Eyebrow>
        <h1 className="text-3xl font-semibold tracking-tight">Memberships</h1>
        <p className="max-w-2xl text-sm text-muted text-pretty">
          From <code className="font-mono text-foreground">GET /api/client/v1/memberships</code>, called with the
          access token. Memberships from a connected system such as HubSpot are read-only and may have no price.
        </p>
      </header>

      {error ? (
        <Card {...rise(1)} className="rise flex items-center gap-3 p-5 text-sm text-warning">
          <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
          {error}
        </Card>
      ) : memberships.length === 0 ? (
        <Card {...rise(1)} className="rise flex items-center gap-3 p-5 text-sm text-muted">
          <CircleDashed aria-hidden="true" className="size-4 shrink-0" />
          No memberships yet.
        </Card>
      ) : (
        <Card {...rise(1)} className="rise p-2">
          <ul className="divide-y divide-border">
            {memberships.map((membership) => {
              const price = formatPrice(membership);
              const renews = formatDate(membership.renewalDate);
              const ends = formatDate(membership.endDate);
              return (
                <li key={membership.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-3 py-4">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-pretty break-words">{membership.name}</p>
                      <SourcePill source={membership.source} />
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-muted tabular-nums">
                      <CalendarDays aria-hidden="true" className="size-3.5" />
                      Since {formatDate(membership.startDate)}
                      {renews ? ` · renews ${renews}` : ends ? ` · ended ${ends}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {price && <span className="text-sm font-medium tabular-nums">{price}</span>}
                    <Pill tone={statusTone(membership)}>
                      {membership.paymentStatus === "past_due" ? "Payment past due" : humanize(membership.status)}
                    </Pill>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}

// The page depends on the session, so it streams in behind a boundary.
export default function MembershipsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <MembershipsPageContent />
    </Suspense>
  );
}
