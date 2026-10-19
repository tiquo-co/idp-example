import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";

import { SignInButton, SignOutButton } from "@/components/auth-buttons";
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
  return session ? <SignOutButton /> : <SignInButton label="Sign in" />;
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4">
            <nav className="flex flex-wrap items-center gap-4 text-sm">
              <Link href="/" className="font-semibold">
                Tiquo IDP example
              </Link>
              <Link href="/members" className="text-muted hover:text-foreground">
                Members area
              </Link>
              <Link href="/memberships" className="text-muted hover:text-foreground">
                Memberships
              </Link>
            </nav>
            <Suspense fallback={<span className="h-9 w-20" aria-hidden="true" />}>
              <HeaderAuthButton />
            </Suspense>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
