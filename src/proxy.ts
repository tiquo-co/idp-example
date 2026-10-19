// Runs Auth.js on every page request so an expiring Tiquo access token is
// refreshed and the new (rotated) refresh token is saved in the session
// cookie. Server Components cannot write cookies, so refreshing only there
// would lose the rotated token. Pages still check access themselves.
export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
