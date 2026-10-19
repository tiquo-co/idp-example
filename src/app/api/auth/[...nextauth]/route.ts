// Auth.js routes, including the callback Tiquo redirects to after sign-in:
// /api/auth/callback/tiquo (register this URL on the OAuth client in Tiquo).
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
