import "server-only";

import { connection } from "next/server";

import { auth } from "@/auth";

/**
 * The Auth.js session for this request. `connection()` marks the read as
 * request-time first: Auth.js uses crypto before it reads the cookie, which
 * Cache Components would otherwise try to prerender.
 */
export async function getSession() {
  await connection();
  return auth();
}

/** The signed-in session, or null when signed out or Tiquo ended the session. */
export async function getSignedInSession() {
  const session = await getSession();
  if (!session?.user || session.error) return null;
  return session;
}

export function formatDate(milliseconds: number | undefined) {
  if (milliseconds === undefined) return null;
  return new Date(milliseconds).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function humanize(value: string) {
  return value.replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}
