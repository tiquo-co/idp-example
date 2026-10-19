import { Suspense } from "react";

import { SignInButton } from "@/components/auth-buttons";
import { PageLoading } from "@/components/page-loading";
import { fetchTiquoMemberships, type TiquoApiMembership } from "@/lib/tiquo";
import { formatDate, getSignedInSession, humanize } from "@/lib/session";

function formatPrice(membership: TiquoApiMembership) {
  if (membership.price === undefined || !membership.currency) return null;
  const amount = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: membership.currency,
  }).format(membership.price / 100);
  return membership.billingPeriod ? `${amount} · ${humanize(membership.billingPeriod)}` : amount;
}

// Calls the Tiquo customer API with the IDP access token. Unlike the token
// claims (current memberships only), the API returns every membership,
// including ended ones, with prices.
async function MembershipsPageContent() {
  const session = await getSignedInSession();
  if (!session?.accessToken) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Memberships</h1>
        <p className="text-muted">Sign in to see your memberships.</p>
        <SignInButton />
      </section>
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
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Memberships</h1>
        <p className="text-sm text-muted text-pretty">
          From <code className="font-mono">GET /api/client/v1/memberships</code> on the Tiquo customer
          API, called with the access token. Memberships from a connected system such as HubSpot are
          read-only and may have no price.
        </p>
      </div>

      {error ? (
        <p role="alert" className="rounded-lg bg-warning-surface px-4 py-3 text-sm text-warning">
          {error}
        </p>
      ) : memberships.length === 0 ? (
        <p className="text-sm text-muted">No memberships yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {memberships.map((membership) => {
            const price = formatPrice(membership);
            const renews = formatDate(membership.renewalDate);
            const ends = formatDate(membership.endDate);
            return (
              <li key={membership.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium break-words">{membership.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    Since {formatDate(membership.startDate)}
                    {renews ? ` · renews ${renews}` : ends ? ` · ends ${ends}` : ""}
                    {price ? ` · ${price}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-border px-2 py-0.5">{humanize(membership.status)}</span>
                  {membership.isExternal && (
                    <span className="rounded-full border border-border px-2 py-0.5 text-muted">
                      Managed in {membership.source === "hubspot" ? "HubSpot" : "another system"}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
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
