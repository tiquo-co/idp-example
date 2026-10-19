import { Building2, ChevronRight, Hash, Layers } from "lucide-react";
import type { ReactNode } from "react";

import { ActiveMembershipBadge, MembershipClaimsList } from "@/components/membership-claims";
import { Card, Eyebrow, rise } from "@/components/ui";
import type { TiquoClaims } from "@/lib/tiquo";

type ProfileUser = { name?: string | null; email?: string | null; image?: string | null };

function initials(name: string) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase());
  return letters.join("") || "?";
}

function Avatar({ name, image }: { name: string; image?: string | null }) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element -- Tiquo-hosted profile photo
    return <img src={image} alt="" className="size-14 rounded-full object-cover outline outline-1 -outline-offset-1 outline-black/10" />;
  }
  return (
    <span className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-lg font-semibold text-brand">
      {initials(name)}
    </span>
  );
}

function Stat({ icon, label, value, mono }: { icon: ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    // Inner radius 12px inside the 20px card with 8px padding (concentric).
    <div className="min-w-0 rounded-xl bg-foreground/[0.03] p-4">
      <dt className="flex items-center gap-1.5 text-xs text-muted">
        {icon}
        {label}
      </dt>
      <dd className={`mt-2 truncate text-sm font-medium tabular-nums ${mono ? "font-mono" : ""}`} title={value}>
        {value}
      </dd>
    </div>
  );
}

export function ProfileView({ user, tiquo }: { user: ProfileUser; tiquo?: TiquoClaims }) {
  const name =
    [tiquo?.givenName, tiquo?.familyName].filter(Boolean).join(" ") || user.name || user.email || "Member";
  const memberships = tiquo?.memberships ?? [];

  return (
    <div className="space-y-10">
      <section {...rise(0)} className="rise flex flex-wrap items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar name={name} image={user.image} />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">{name}</h1>
            <p className="truncate text-sm text-muted">{user.email}</p>
          </div>
        </div>
        <ActiveMembershipBadge active={tiquo?.hasActiveMembership ?? false} />
      </section>

      <section {...rise(1)} className="rise">
        <Card className="rounded-[20px] p-2">
          <dl className="grid gap-2 sm:grid-cols-3">
            <Stat icon={<Hash aria-hidden="true" className="size-3.5" />} label="Customer number" value={tiquo?.customerNumber ?? "None"} mono />
            <Stat
              icon={<Layers aria-hidden="true" className="size-3.5" />}
              label="Current memberships"
              value={String(memberships.length)}
            />
            <Stat icon={<Building2 aria-hidden="true" className="size-3.5" />} label="Organisation" value={tiquo?.organizationId ?? "None"} mono />
          </dl>
        </Card>
      </section>

      <section {...rise(2)} className="rise space-y-4">
        <div className="space-y-1.5">
          <Eyebrow>From the token</Eyebrow>
          <h2 className="text-lg font-semibold tracking-tight">Current memberships</h2>
          <p className="max-w-2xl text-sm text-muted text-pretty">
            Read from the <code className="font-mono text-foreground">memberships</code> and{" "}
            <code className="font-mono text-foreground">has_active_membership</code> claims. They refresh with the
            access token every hour, so a cancelled membership disappears without a new sign-in.
          </p>
        </div>
        <MembershipClaimsList memberships={memberships} />
      </section>

      <section {...rise(3)} className="rise">
        <Card className="group">
          <details>
            <summary className="flex h-12 cursor-pointer list-none items-center gap-2 px-5 text-sm font-medium [&::-webkit-details-marker]:hidden">
              <ChevronRight aria-hidden="true" className="size-4 text-muted transition-transform duration-150 group-has-[details[open]]:rotate-90" />
              Tiquo claims in this session
            </summary>
            <pre className="overflow-x-auto border-t border-border px-5 py-4 font-mono text-xs leading-relaxed text-muted">
              {JSON.stringify(tiquo, null, 2)}
            </pre>
          </details>
        </Card>
      </section>
    </div>
  );
}
