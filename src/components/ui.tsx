import type { ComponentProps, CSSProperties, ReactNode } from "react";

// Small shared building blocks. Cards use layered shadows rather than
// borders; nested surfaces use concentric radii (outer = inner + padding).

export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`rounded-2xl bg-card shadow-card ${className}`} {...props} />;
}

const buttonBase =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium " +
  "transition-[scale,opacity,background-color,box-shadow] duration-150 ease-out active:scale-[0.96] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export const buttonStyles = {
  primary: `${buttonBase} bg-accent text-accent-foreground shadow-raised hover:opacity-90`,
  secondary: `${buttonBase} bg-card text-foreground shadow-card hover:shadow-raised`,
};

type Tone = "neutral" | "brand" | "success" | "warning";

const toneStyles: Record<Tone, string> = {
  neutral: "bg-foreground/5 text-muted",
  brand: "bg-brand-soft text-brand",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
};

export function Pill({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${toneStyles[tone]}`}>
      {children}
    </span>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-medium uppercase tracking-[0.14em] text-brand">{children}</p>;
}

/** Staggered entrance (with the `rise` class): each step starts 80ms after the previous one. */
export function rise(step: number): { style: CSSProperties } {
  return { style: { "--delay": `${step * 80}ms` } as CSSProperties };
}
