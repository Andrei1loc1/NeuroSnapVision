import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Sentry integration (disabled until @sentry/nextjs is installed + DSN configured)
//
// 1) npm i @sentry/nextjs
// 2) Set NEXT_PUBLIC_SENTRY_DSN (client) + SENTRY_DSN (server, optional) in Vercel
// 3) Uncomment the wrapper below and run `npx @sentry/wizard@latest -i nextjs`
//    to generate the source maps config + instrumentation hook if needed.
//
// import { withSentryConfig } from "@sentry/nextjs";
// export default withSentryConfig(nextConfig, {
//   silent: true,
//   org: process.env.SENTRY_ORG,
//   project: process.env.SENTRY_PROJECT,
//   // Only upload source maps when SENTRY_AUTH_TOKEN is present (CI builds)
//   sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
//   // Auto-tree-shake Sentry in production when DSN is absent
//   hideSourceMaps: true,
//   disableLogger: true,
// });
// ─────────────────────────────────────────────────────────────────────────────

export default nextConfig;