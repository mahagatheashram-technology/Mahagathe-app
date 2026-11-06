import type { AuthConfig } from "convex/server";

// No provider is configured in a zero-key local checkout. The dashboard variable
// must be set before deploying authenticated endpoints.
export default {
  providers: process.env.CLERK_JWT_ISSUER_DOMAIN
    ? [{ domain: process.env.CLERK_JWT_ISSUER_DOMAIN, applicationID: "convex" }]
    : [],
} satisfies AuthConfig;
