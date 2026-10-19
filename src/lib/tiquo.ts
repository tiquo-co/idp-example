import "server-only";

// Everything this app needs from the Tiquo IDP, found through OIDC discovery
// on the issuer: https://auth.tiquo.app/.well-known/openid-configuration

export const TIQUO_ISSUER = process.env.AUTH_TIQUO_ISSUER ?? "https://auth.tiquo.app";

type TiquoMetadata = {
  issuer: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  revocation_endpoint: string;
  end_session_endpoint: string;
};

let metadataPromise: Promise<TiquoMetadata> | undefined;

export function tiquoMetadata(): Promise<TiquoMetadata> {
  metadataPromise ??= fetch(`${TIQUO_ISSUER}/.well-known/openid-configuration`, {
    cache: "force-cache",
  }).then(async (response) => {
    if (!response.ok) {
      metadataPromise = undefined;
      throw new Error(`Tiquo discovery failed with ${response.status}`);
    }
    return (await response.json()) as TiquoMetadata;
  });
  return metadataPromise;
}

/** One current membership, as listed in the `memberships` token claim. Times are in seconds. */
export type TiquoMembershipClaim = {
  id: string;
  /** "tiquo" for memberships sold in Tiquo; "hubspot" for read-only ones from a connected system. */
  source: "tiquo" | "hubspot";
  plan_id?: string;
  name: string;
  status: string;
  payment_status?: string;
  starts_at: number;
  renews_at?: number;
  ends_at?: number;
};

/** The Tiquo customer and membership claims this app keeps in its session. */
export type TiquoClaims = {
  organizationId?: string;
  customerId?: string;
  customerNumber?: string;
  givenName?: string;
  familyName?: string;
  /** True while the customer has at least one current membership. */
  hasActiveMembership: boolean;
  memberships: TiquoMembershipClaim[];
};

/**
 * Read the claims out of a Tiquo access token. The token comes straight from
 * Tiquo's token endpoint over TLS, so it is decoded here, not re-verified.
 * Verify it against the JWKS (`jwks_uri`) before trusting one that arrived
 * any other way.
 */
export function tiquoClaimsFromAccessToken(accessToken: string): TiquoClaims {
  const payload = JSON.parse(
    Buffer.from(accessToken.split(".")[1] ?? "", "base64url").toString("utf8"),
  ) as Record<string, unknown>;
  const text = (value: unknown) => (typeof value === "string" ? value : undefined);
  return {
    organizationId: text(payload.organization_id),
    customerId: text(payload.org_customer_id),
    customerNumber: text(payload.customer_number),
    givenName: text(payload.given_name),
    familyName: text(payload.family_name),
    hasActiveMembership: payload.has_active_membership === true,
    memberships: Array.isArray(payload.memberships)
      ? (payload.memberships as TiquoMembershipClaim[])
      : [],
  };
}

// Tiquo OAuth clients authenticate with HTTP Basic (client_secret_basic).
function clientAuthorization() {
  const id = encodeURIComponent(process.env.AUTH_TIQUO_ID ?? "");
  const secret = encodeURIComponent(process.env.AUTH_TIQUO_SECRET ?? "");
  return `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
}

export type TiquoTokens = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
};

/**
 * Exchange a refresh token for new tokens. Tiquo rotates refresh tokens: use
 * the new one from now on. Every refreshed access token carries current
 * membership claims, so a cancelled membership shows within the hour.
 */
export async function refreshTiquoTokens(refreshToken: string): Promise<TiquoTokens> {
  const { token_endpoint } = await tiquoMetadata();
  const response = await fetch(token_endpoint, {
    method: "POST",
    headers: {
      Authorization: clientAuthorization(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Tiquo token refresh failed: ${body.error ?? response.status}`);
  }
  return body as TiquoTokens;
}

/** Revoke a refresh token (RFC 7009) when the user signs out. */
export async function revokeTiquoRefreshToken(refreshToken: string): Promise<void> {
  const { revocation_endpoint } = await tiquoMetadata();
  await fetch(revocation_endpoint, {
    method: "POST",
    headers: {
      Authorization: clientAuthorization(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ token: refreshToken, token_type_hint: "refresh_token" }),
    cache: "no-store",
  });
}

/**
 * Tiquo's end-session URL: it ends the Tiquo sign-in in this browser, so the
 * next sign-in asks for a new code, then returns to `postLogoutRedirectUri`.
 * That address must be on the same origin as one of the client's redirect URIs.
 */
export async function tiquoLogoutUrl(postLogoutRedirectUri: string): Promise<string> {
  const { end_session_endpoint } = await tiquoMetadata();
  const url = new URL(end_session_endpoint);
  url.searchParams.set("client_id", process.env.AUTH_TIQUO_ID ?? "");
  url.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);
  return url.toString();
}

/** A membership from the Tiquo customer API (GET /api/client/v1/memberships). */
export type TiquoApiMembership = {
  id: string;
  name: string;
  status: string;
  source: "tiquo" | "hubspot";
  isExternal: boolean;
  isCurrent: boolean;
  planId?: string;
  price?: number;
  currency?: string;
  billingPeriod?: string;
  paymentStatus?: string;
  startDate: number;
  renewalDate?: number;
  endDate?: number;
};

/**
 * The customer API accepts the IDP access token as a Bearer token. Here it
 * lists every membership, including ended ones, with prices.
 */
export async function fetchTiquoMemberships(accessToken: string): Promise<TiquoApiMembership[]> {
  const { token_endpoint } = await tiquoMetadata();
  const apiOrigin = new URL(token_endpoint).origin;
  const response = await fetch(`${apiOrigin}/api/client/v1/memberships`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    throw new Error(body.error ?? `Tiquo customer API returned ${response.status}`);
  }
  return body.data?.memberships ?? [];
}
