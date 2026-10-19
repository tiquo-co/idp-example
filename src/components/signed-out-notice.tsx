import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card, rise } from "@/components/ui";

/** A centred message card for pages a visitor cannot see yet. */
export function Notice({
  icon: Icon,
  title,
  children,
  action,
  tone = "neutral",
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  action?: ReactNode;
  tone?: "neutral" | "warning";
}) {
  return (
    <Card {...rise(0)} className="rise mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-10 text-center">
      <span
        className={`flex size-11 items-center justify-center rounded-full ${
          tone === "warning" ? "bg-warning-soft text-warning" : "bg-foreground/[0.06] text-muted"
        }`}
      >
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight text-balance">{title}</h1>
        <p className="text-sm text-muted text-pretty">{children}</p>
      </div>
      {action}
    </Card>
  );
}
