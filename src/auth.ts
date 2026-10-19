import NextAuth from "next-auth";
import type { OIDCConfig } from "next-auth/providers";

import {
  TIQUO_ISSUER,
  refreshTiquoTokens,
  revokeTiquoRefreshToken,
  tiquoClaimsFromAccessToken,
  type TiquoClaims,
} from "@/lib/tiquo";

declare module "next-auth" {
  interface Session {
    /** The Tiquo access token, for the customer API. Server code reads it via `auth()`. */
    accessToken?: string;
    tiquo?: TiquoClaims;
    /** Set when Tiquo refused to refresh the session; the user must sign in again. */
    error?: "RefreshTokenError";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    /** When the access token expires, in seconds. */
    expiresAt?: number;
    tiquo?: TiquoClaims;
    error?: "RefreshTokenError";
  }
}

type TiquoProfile = {
  sub: string;
  email?: string;
  name?: string;
  display_name?: string;
  picture?: string;
};

// The Tiquo IDP as a standard OpenID Connect provider. Auth.js reads the
// endpoints from the issuer's discovery document and checks the ID token's
// issuer, audience, expiry and nonce. It does not check the signature: the
// token comes straight from Tiquo's token endpoint over HTTPS, which OIDC
// Core 3.1.3.7 allows in place of signature validation, so Tiquo's signing-key
// rotation never affects this app.
const tiquo: OIDCConfig<TiquoProfile> = {
  id: "tiquo",
  name: "Tiquo",
  type: "oidc",
  issuer: TIQUO_ISSUER,
  clientId: process.env.AUTH_TIQUO_ID,
  clientSecret: process.env.AUTH_TIQUO_SECRET,
  checks: ["pkce", "state", "nonce"],
  // offline_access returns a refresh token; the sign-in then lasts the
  // organisation's Website SDK session duration.
  authorization: { params: { scope: "openid profile email offline_access" } },
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name ?? profile.display_name ?? profile.email ?? null,
      email: profile.email ?? null,
      image: profile.picture ?? null,
    };
  },
};

// Refresh a little before expiry so a request never carries an expired token.
const REFRESH_MARGIN_SECONDS = 60;

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [tiquo],
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    async jwt({ token, account }) {
      // First sign-in: keep Tiquo's tokens, encrypted in the session cookie.
      if (account?.access_token) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
          tiquo: tiquoClaimsFromAccessToken(account.access_token),
          error: undefined,
        };
      }

      const now = Math.floor(Date.now() / 1000);
      if (!token.expiresAt || now < token.expiresAt - REFRESH_MARGIN_SECONDS) return token;
      if (!token.refreshToken) return { ...token, error: "RefreshTokenError" };

      try {
        const tokens = await refreshTiquoTokens(token.refreshToken);
        return {
          ...token,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token ?? token.refreshToken,
          expiresAt: now + tokens.expires_in,
          tiquo: tiquoClaimsFromAccessToken(tokens.access_token),
          error: undefined,
        };
      } catch (error) {
        console.error("[auth] Tiquo refresh failed:", error);
        return { ...token, error: "RefreshTokenError" };
      }
    },
    session({ session, token }) {
      session.accessToken = token.accessToken;
      session.tiquo = token.tiquo;
      session.error = token.error;
      return session;
    },
  },
  events: {
    async signOut(message) {
      const refreshToken = "token" in message ? message.token?.refreshToken : undefined;
      if (refreshToken) {
        await revokeTiquoRefreshToken(refreshToken).catch((error) =>
          console.error("[auth] Tiquo revocation failed:", error),
        );
      }
    },
  },
});
