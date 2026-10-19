<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./public/images/tiquo-white.svg">
    <img src="./public/images/tiquo-black.svg" height="64" alt="Tiquo">
  </picture>
</div>

<div align="center">
  <p><strong>IDP × Next.js example</strong></p>
  <p>Member sign-in powered by Tiquo as an OpenID Connect identity provider.</p>

  <p>
    <a href="https://www.tiquo.co"><img src="https://img.shields.io/badge/Website-tiquo.co-blue" alt="Website"></a>
    <a href="https://docs.tiquo.co/en/docs/api-reference/oauth-oidc/customer-authentication"><img src="https://img.shields.io/badge/Docs-OAuth_%2F_OIDC-green" alt="OAuth / OIDC documentation"></a>
    <a href="https://authjs.dev/"><img src="https://img.shields.io/badge/Auth.js-5.0.0--beta.32-6F42C1" alt="Auth.js 5.0.0-beta.32"></a>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16.4-black" alt="Next.js 16.4"></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.3-149ECA" alt="React 19.3"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.9-blue" alt="TypeScript 5.9"></a>
  </p>
</div>

---

## Contents

- [Overview](#overview)
- [Architecture and tech stack](#architecture-and-tech-stack)
- [Repository structure](#repository-structure)
- [Getting started](#getting-started)
- [Environment configuration](#environment-configuration)
- [Integration architecture](#integration-architecture)
- [Development commands](#development-commands)
- [Testing and quality](#testing-and-quality)
- [Documentation](#documentation)

## Overview

This is a from-scratch Next.js example showing how an app can use **Tiquo as its identity provider** over OpenID Connect with [Auth.js](https://authjs.dev).

Members sign in with a one-time code on Tiquo's branded sign-in page. The app then receives their Tiquo customer profile and current memberships in the tokens. The example shows:

- signing in with PKCE, `state` and `nonce`;
- reading customer and membership claims;
- gating a members-only area on `has_active_membership`;
- calling the Tiquo customer API with the access token;
- keeping claims current with rotating refresh tokens;
- signing out by revoking the refresh token and ending the Tiquo sign-in session.

## Architecture and tech stack

| Layer             | Current implementation                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| Web               | Next.js `16.4.2` App Router with Cache Components                                                            |
| UI                | React and React DOM `19.3.0`, Tailwind CSS `4.3`, Lucide icons                                               |
| Authentication    | Auth.js (`next-auth` `5.0.0-beta.32`) with Tiquo as a custom OpenID Connect provider                         |
| Identity provider | Tiquo IDP (`https://auth.tiquo.app`): authorization code with PKCE, nonce, refresh tokens, revocation and end session |
| Language          | TypeScript `5.9.3`                                                                                           |
| Quality           | ESLint `9.39.5` with Next.js Core Web Vitals and TypeScript rules                                            |

## Repository structure

```text
idp-example/
├── public/images/                   # Tiquo brand assets
├── src/
│   ├── app/                         # App Router pages and global styles
│   │   ├── api/auth/[...nextauth]/  # Auth.js routes, including the Tiquo callback
│   │   ├── members/                 # Members-only area (has_active_membership)
│   │   ├── memberships/             # Memberships from the Tiquo customer API
│   │   ├── actions.ts               # Sign-in and sign-out server actions
│   │   └── page.tsx                 # Sign-in page and member profile
│   ├── components/                  # Site UI (profile, membership cards, header)
│   ├── lib/
│   │   ├── tiquo.ts                 # Tiquo discovery, claims, refresh, revocation, logout, customer API
│   │   └── session.ts               # Request-time session helpers
│   ├── auth.ts                      # Auth.js configuration and the Tiquo provider
│   └── proxy.ts                     # Keeps Tiquo tokens refreshed on page requests
├── .env.example                     # Environment template
├── package.json                     # Dependencies and development commands
└── next.config.ts                   # Next.js configuration
```

## Getting started

### Prerequisites

- Node.js `20.9.0` or newer, as required by Next.js 16.
- pnpm.
- A Tiquo OAuth client from **Tiquo Dashboard → Settings → IDP**, with this app's callback as a redirect URI.

### Install and run

```bash
git clone https://github.com/tiquo-co/idp-example.git
cd idp-example
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and choose **Sign in with Tiquo**.

## Environment configuration

Set these in `.env.local`:

```bash
AUTH_SECRET=generate_with_npx_auth_secret
AUTH_TIQUO_ID=your_oauth_client_id
AUTH_TIQUO_SECRET=your_oauth_client_secret
AUTH_TIQUO_ISSUER=https://auth.tiquo.app
```

- `AUTH_SECRET` encrypts the session cookie. Generate one with `npx auth secret`, and use a different value in each environment.
- `AUTH_TIQUO_ID` and `AUTH_TIQUO_SECRET` come from the OAuth client in **Tiquo Dashboard → Settings → IDP**.
- The client's redirect URIs must include this app's callback:
  - local: `http://localhost:3000/api/auth/callback/tiquo`
  - deployed: `https://<your-domain>/api/auth/callback/tiquo`

The client secret is a server secret. Never put it, or any other secret, in a variable beginning with `NEXT_PUBLIC_`. On Vercel, add the same four variables under **Project Settings → Environment Variables**, then redeploy.

## Integration architecture

- `src/auth.ts` registers Tiquo as an OIDC provider.
  - Auth.js reads the endpoints from `https://auth.tiquo.app/.well-known/openid-configuration`.
  - It requests `openid profile email offline_access` with PKCE, `state` and `nonce`.
  - Tiquo's tokens are kept in the encrypted session cookie.
- `src/lib/tiquo.ts` wraps the Tiquo endpoints the app calls directly: token refresh, revocation, the end-session URL and `GET /api/client/v1/memberships`. It also reads the customer and membership claims from the access token. The client authenticates with HTTP Basic (`client_secret_basic`).
- `src/proxy.ts` runs Auth.js on every page request. An expiring access token is refreshed there, so the rotated refresh token is saved in the cookie; Server Components can't write cookies.
- `src/app/actions.ts` signs in with Tiquo. Signing out clears the app session, revokes the refresh token and redirects to Tiquo's end-session endpoint, so the next sign-in asks for a new code.
- `src/app/members/page.tsx` decides access on the server from `has_active_membership`.
- `src/app/memberships/page.tsx` calls the customer API with the access token, so it lists every membership, including ended ones.

### Tokens and claims

- **ID token** (audience: your client ID): the profile plus customer and membership claims.
- **Access token** (audience: `tiquo-client-api`): the same claims. Use it as a Bearer token on the Tiquo customer API. It lasts one hour.
- **Refresh token**: rotated on every use. It lasts the organisation's Website SDK session duration.
- **Customer claims**: `org_customer_id`, `customer_number`, `given_name`, `family_name`, `name`, `picture` and `organization_id`. Tiquo links a sign-in to the customer profile with that email (primary or secondary) in the OAuth client's organisation, or creates one.
- **Membership claims**:
  - `memberships` lists up to 10 current memberships. Each has `id`, `source` (`tiquo` or `hubspot`), `plan_id` (Tiquo memberships only), `name`, `status`, `payment_status` and `starts_at`/`renews_at`/`ends_at` (Unix seconds).
  - `has_active_membership` is `true` while any membership is current. A HubSpot membership with an unpaid invoice stays active until HubSpot marks it cancelled.
- **Signing keys (JWKS)**:
  - Tiquo signs tokens with keys published at `https://edge.tiquo.app/api/auth/jwks` and rotates them every 90 days. A retired key stays published for a week.
  - This app receives its tokens directly from the token endpoint over HTTPS, so it trusts them without checking their signatures, as OIDC allows.
  - Any code that receives a Tiquo token another way must verify it against the JWKS. For example: your own API receiving an access token from a mobile app.

The session also includes the access token, so server code can call the customer API. Auth.js returns the session to the signed-in user's browser at `/api/auth/session`. The token only grants access to that member's own data.

## Development commands

| Command          | What it does                            |
| ---------------- | --------------------------------------- |
| `pnpm dev`       | Starts the Next.js development server   |
| `pnpm build`     | Creates an optimized production build   |
| `pnpm start`     | Serves the production build             |
| `pnpm typecheck` | Checks TypeScript without emitting files |
| `pnpm lint`      | Runs ESLint across the repository       |

## Testing and quality

Run the full local validation set before opening a pull request:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Documentation

- [Tiquo OAuth / OIDC customer authentication](https://docs.tiquo.co/en/docs/api-reference/oauth-oidc/customer-authentication)
- [Tiquo customer API: memberships](https://docs.tiquo.co/en/docs/api-reference/customer-api/memberships)
- [Tiquo IDP discovery document](https://auth.tiquo.app/.well-known/openid-configuration)
- [Auth.js documentation](https://authjs.dev/)
