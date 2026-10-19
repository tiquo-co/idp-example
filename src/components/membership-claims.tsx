import type { TiquoMembershipClaim } from "@/lib/tiquo";
import { formatDate, humanize } from "@/lib/session";

export function ActiveMembershipBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="rounded-full bg-success-surface px-2.5 py-1 text-xs font-medium text-success">
      Active member
    </span>
  ) : (
    <span className="rounded-full bg-warning-surface px-2.5 py-1 text-xs font-medium text-warning">
      No active membership
    </span>
  );
}

/** Current memberships from the `memberships` token claim (times in seconds). */
export function MembershipClaimsList({ memberships }: { memberships: TiquoMembershipClaim[] }) {
  if (memberships.length === 0) {
    return <p className="text-sm text-muted">No current memberships.</p>;
  }
  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {memberships.map((membership) => {
        const renews = formatDate(membership.renews_at && membership.renews_at * 1000);
        const ends = formatDate(membership.ends_at && membership.ends_at * 1000);
        return (
          <li key={membership.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="font-medium break-words">{membership.name}</p>
              <p className="mt-1 text-sm text-muted">
                Since {formatDate(membership.starts_at * 1000)}
                {renews ? ` · renews ${renews}` : ends ? ` · ends ${ends}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-border px-2 py-0.5">{humanize(membership.status)}</span>
              {membership.payment_status && (
                <span className="rounded-full border border-border px-2 py-0.5">
                  Payment: {humanize(membership.payment_status)}
                </span>
              )}
              <span className="rounded-full border border-border px-2 py-0.5 text-muted">
                {membership.source === "tiquo" ? "Tiquo" : "HubSpot"}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
