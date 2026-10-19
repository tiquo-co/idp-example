import "server-only";

import { auth } from "@/auth";

/** The signed-in session, or null when signed out or Tiquo ended the session. */
export async function getSignedInSession() {
  const session = await auth();
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
