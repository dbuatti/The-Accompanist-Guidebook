/** @type {import('next').NextConfig} */

// Security headers applied to every route. CSP is intentionally deferred to a
// follow-up hardening pass: a strict policy needs per-domain allowlisting for
// YouTube embeds, Neon Auth's hosted flow, Stripe checkout, Google Fonts and
// the Gemini/Resend/Kit integrations, and must be verified in a real browser
// (the automated smoke test does not execute JavaScript or render frames).
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
