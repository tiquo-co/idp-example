# Tiquo IDP example

A Next.js app that uses **Tiquo as its identity provider** over OpenID Connect, with [Auth.js](https://authjs.dev). Members sign in with a one-time code on Tiquo's branded sign-in page. The app receives their Tiquo customer profile and current memberships in the tokens.

What it shows:

| Feature | Where |
| --- | --- |
| Tiquo as a custom OIDC provider (PKCE, state and nonce checks, ID token verified against Tiquo's JWKS) | [`src/auth.ts`](src/auth.ts) |
| Customer and membership claims: `org_customer_id`, `customer_number`, `memberships`, `has_active_membership` | [`src/app/page.tsx`](src/app/page.tsx) |
| A members-only area gated on `has_active_membership` | [`src/app/members/page.tsx`](src/app/members/page.tsx) |
| Calling the Tiquo customer API with the access token | [`src/app/memberships/page.tsx`](src/app/memberships/page.tsx) |
| Refresh-token rotation, so membership claims stay current | [`src/auth.ts`](src/auth.ts), [`src/proxy.ts`](src/proxy.ts) |
| Sign-out: revoke the refresh token, then end the Tiquo sign-in session | [`src/app/actions.ts`](src/app/actions.ts) |

## Setup

1. In the Tiquo dashboard, go to **Settings > Identity Provider** and create an OAuth client. Its redirect URI is your app's callback:
   - local: `http://localhost:3000/api/auth/callback/tiquo`
   - deployed: `https://<your-domain>/api/auth/callback/tiquo`
2. Copy `.env.example` to `.env.local` and fill in the client ID and secret. Generate `AUTH_SECRET` with `npx auth secret`.
3. Install and run:

   ```bash
   pnpm install
   pnpm dev
   ```

4. Open http://localhost:3000 and choose **Sign in with Tiquo**.

## Environment variables

| Variable | Value |
| --- | --- |
| `AUTH_SECRET` | Random secret that encrypts the session cookie |
| `AUTH_TIQUO_ID` | OAuth client ID from Tiquo |
| `AUTH_TIQUO_SECRET` | OAuth client secret from Tiquo |
| `AUTH_TIQUO_ISSUER` | `https://auth.tiquo.app` |

On Vercel, add the same four variables under **Project Settings > Environment Variables**. Then add the deployed callback URL as a redirect URI on the OAuth client in Tiquo.

## How it works

- **Discovery.** Endpoints come from `https://auth.tiquo.app/.well-known/openid-configuration`: authorize, token, userinfo, JWKS, revocation and end session.
- **Sign-in.** Auth.js sends the member to Tiquo's sign-in page with PKCE, `state` and `nonce`. Tiquo matches the member to the customer profile with that email in the OAuth client's organisation, or creates one. It then returns a code to `/api/auth/callback/tiquo`.
- **Tokens.** The client authenticates with HTTP Basic (`client_secret_basic`).
  - The **ID token** (audience: this client) carries the profile and membership claims.
  - The **access token** (audience: `tiquo-client-api`) works as a Bearer token on the Tiquo customer API, and carries the same claims.
  - With `offline_access`, a rotating **refresh token** is issued. It lasts as long as the organisation's Website SDK session duration.
- **Membership claims.** `memberships` lists current memberships, at most 10. Each has `id`, `source` (`tiquo` or `hubspot`), `plan_id` (Tiquo only), `name`, `status`, `payment_status` and `starts_at`/`renews_at`/`ends_at` (seconds). `has_active_membership` is `true` while any is current. A HubSpot membership with an unpaid invoice stays active until HubSpot marks it cancelled.
- **Refresh.** Access tokens last an hour, and each refresh re-reads memberships from Tiquo. The proxy refreshes on page requests so the rotated refresh token is saved in the cookie, because Server Components cannot write cookies.
- **Sign-out.** The app clears its session and revokes the refresh token (`/api/auth/oauth2/revoke`). It then redirects to Tiquo's end-session endpoint, so the next sign-in asks for a new code. The return address must be on the same origin as one of the client's redirect URIs.
- **Access token in the session.** The session includes the access token so server code can call the customer API. Auth.js also returns the session to the signed-in user's browser at `/api/auth/session`. The token only grants access to that member's own data, as with the Tiquo DOM package.
