import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { Suspense } from "react";

import { SignInButton, SignOutButton } from "@/components/auth-buttons";
import { NavLinks } from "@/components/nav-links";
import { getSignedInSession } from "@/lib/session";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tiquo IDP example",
  description: "An example app that signs members in with the Tiquo identity provider.",
};

// Reads the session cookie, so it streams in behind a Suspense boundary
// (Cache Components) while the rest of the header is prerendered.
async function HeaderAuthButton() {
  const session = await getSignedInSession();
  return session ? <SignOutButton /> : <SignInButton label="Sign in" compact />;
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-10 bg-background/70 shadow-[0_1px_0_var(--border)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-6 px-4 py-3">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex h-10 shrink-0 items-center gap-2.5 font-semibold tracking-tight">
                <span className="flex size-8 items-center justify-center rounded-[10px] bg-accent text-accent-foreground shadow-raised">
                  <KeyRound aria-hidden="true" className="size-4" />
                </span>
                IDP example
              </Link>
              <div className="hidden sm:block">
                <NavLinks />
              </div>
            </div>
            <Suspense fallback={<span className="h-10 w-24" aria-hidden="true" />}>
              <HeaderAuthButton />
            </Suspense>
          </div>
          {/* Small screens: navigation on its own scrollable row. */}
          <div className="mx-auto -mt-1 max-w-4xl overflow-x-auto px-2 pb-2 sm:hidden">
            <NavLinks />
          </div>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:py-16">{children}</main>
        <footer className="mx-auto w-full max-w-4xl px-4 pb-10 text-xs text-muted">
          Signed in with the Tiquo identity provider over OpenID Connect ·{" "}
          <a
            href="https://auth.tiquo.app/.well-known/openid-configuration"
            className="underline decoration-foreground/20 underline-offset-4 hover:text-foreground"
          >
            Discovery document
          </a>
        </footer>
      </body>
    </html>
  );
}
