import { BadgeCheck, Mail, RefreshCw } from "lucide-react";

import { SignInButton } from "@/components/auth-buttons";
import { Card, Eyebrow, buttonStyles, rise } from "@/components/ui";

const features = [
  {
    icon: Mail,
    title: "One-time code sign-in",
    body: "Members sign in on Tiquo's branded page with a code sent to their email. No passwords to manage.",
  },
  {
    icon: BadgeCheck,
    title: "Memberships in the token",
    body: "The tokens carry the member's customer profile, current memberships and has_active_membership.",
  },
  {
    icon: RefreshCw,
    title: "Always current",
    body: "Tokens refresh every hour and re-read memberships, so a cancellation shows up without a new sign-in.",
  },
];

const steps = [
  "The app sends the member to Tiquo's sign-in page (OpenID Connect with PKCE, state and nonce).",
  "Tiquo matches the email to the club's customer profile, or creates one, and returns a code.",
  "The app exchanges the code for tokens and reads the member's profile and memberships.",
];

export function SignedOutHero({ sessionEnded }: { sessionEnded: boolean }) {
  return (
    <div className="space-y-16">
      <section className="max-w-2xl space-y-6">
        <div {...rise(0)} className="rise">
          <Eyebrow>OpenID Connect example</Eyebrow>
        </div>
        <h1 {...rise(1)} className="rise text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Members sign in with their club account
        </h1>
        <p {...rise(2)} className="rise text-lg text-muted text-pretty">
          This app uses Tiquo as its identity provider. One sign-in gives it the member&apos;s profile and
          memberships, ready to unlock members-only features.
        </p>
        {sessionEnded && (
          <p role="alert" className="rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">
            Your session has ended. Please sign in again.
          </p>
        )}
        <div {...rise(3)} className="rise flex flex-wrap items-center gap-3">
          <SignInButton />
          <a href="#how-it-works" className={buttonStyles.secondary}>
            How it works
          </a>
        </div>
      </section>

      <section aria-label="Features" className="grid gap-3 sm:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={feature.title} {...rise(4 + index)} className="rise space-y-3 p-5">
            <span className="flex size-9 items-center justify-center rounded-[10px] bg-brand-soft text-brand">
              <feature.icon aria-hidden="true" className="size-4" />
            </span>
            <h2 className="font-medium">{feature.title}</h2>
            <p className="text-sm text-muted text-pretty">{feature.body}</p>
          </Card>
        ))}
      </section>

      <section id="how-it-works" {...rise(7)} className="rise scroll-mt-24 space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">How it works</h2>
        <Card className="p-2">
          <ol className="divide-y divide-border">
            {steps.map((step, index) => (
              <li key={step} className="flex items-start gap-4 px-3 py-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground/[0.06] text-xs font-semibold tabular-nums">
                  {index + 1}
                </span>
                <p className="pt-0.5 text-sm text-pretty">{step}</p>
              </li>
            ))}
          </ol>
        </Card>
      </section>
    </div>
  );
}
