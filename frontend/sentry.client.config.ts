// Sentry client init — no-op until @sentry/nextjs is installed + NEXT_PUBLIC_SENTRY_DSN is set.
// Next.js auto-loads this file on the client when present.
//
// Activate:
//   1) npm i @sentry/nextjs
//   2) Set NEXT_PUBLIC_SENTRY_DSN in Vercel (client-safe DSN)
//
// Dynamic import avoids a hard build/typecheck failure when the package is absent.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || "";
if (dsn) {
  import("@sentry/nextjs")
    .then((Sentry) =>
      Sentry.init({
        dsn,
        tracesSampleRate: 0.1,
        environment: process.env.NODE_ENV,
        enabled: true,
      }),
    )
    .catch((err) => console.error("[sentry.client] failed to load @sentry/nextjs:", err));
} else {
  // No DSN → Sentry stays disabled (no network, no overhead).
}