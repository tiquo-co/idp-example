"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";
import { tiquoLogoutUrl } from "@/lib/tiquo";

export async function signInWithTiquo() {
  await signIn("tiquo", { redirectTo: "/" });
}

/**
 * Sign out of this app (the signOut event revokes the Tiquo refresh token),
 * then end the Tiquo sign-in session so the next sign-in asks for a new code.
 */
export async function signOutOfTiquo() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const logoutUrl = await tiquoLogoutUrl(`${protocol}://${host}/`);
  await signOut({ redirect: false });
  redirect(logoutUrl);
}
