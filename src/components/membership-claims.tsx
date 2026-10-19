import { BadgeCheck, CalendarDays, CircleDashed } from "lucide-react";

import { Card, Pill } from "@/components/ui";
import type { TiquoMembershipClaim } from "@/lib/tiquo";
import { formatDate, humanize } from "@/lib/session";

export function ActiveMembershipBadge({ active }: { active: boolean }) {
  return active ? (
    <Pill tone="success">
      <BadgeCheck aria-hidden="true" className="size-3.5" />
      Active member
    </Pill>
  ) : (
    <Pill tone="warning">
      <CircleDashed aria-hidden="true" className="size-3.5" />
      No active membership
    </Pill>
  );
}

export function SourcePill({ source }: { source: "tiquo" | "hubspot" }) {
  return source === "tiquo" ? <Pill tone="brand">Tiquo</Pill> : <Pill>HubSpot</Pill>;
}

/** Current memberships from the `memberships` token claim (times in seconds). */
export function MembershipClaimsList({ memberships }: { memberships: TiquoMembershipClaim[] }) {
  if (memberships.length === 0) {
    return (
      <Card className="flex items-center gap-3 p-5 text-sm text-muted">
        <CircleDashed aria-hidden="true" className="size-4 shrink-0" />
        No current memberships.
      </Card>
    );
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {memberships.map((membership) => {
        const renews = formatDate(membership.renews_at && membership.renews_at * 1000);
        const ends = formatDate(membership.ends_at && membership.ends_at * 1000);
        return (
          <li key={membership.id}>
            <Card className="flex h-full flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-pretty break-words">{membership.name}</p>
                <SourcePill source={membership.source} />
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-2">
                <Pill tone={membership.payment_status === "past_due" ? "warning" : "success"}>
                  {membership.payment_status === "past_due" ? "Payment past due" : humanize(membership.status)}
                </Pill>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted tabular-nums">
                  <CalendarDays aria-hidden="true" className="size-3.5" />
                  Since {formatDate(membership.starts_at * 1000)}
                  {renews ? ` · renews ${renews}` : ends ? ` · ends ${ends}` : ""}
                </span>
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
