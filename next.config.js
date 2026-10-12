/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development";

// Two-tier CSP rollout.
//
// 1. ENFORCED, CACHEABLE baseline (below, via next.config headers). Cache-safe
//    because it contains no per-request nonce, so it costs nothing on the CDN.
//    `script-src` keeps 'unsafe-inline' because Next 14 App Router emits inline
//    hydration/flight scripts that a no-nonce policy would otherwise block, but
//    every other directive is locked down and remote scripts are restricted to
//    the two YouTube origins the video player needs.
//
// 2. REPORT-ONLY strict nonce policy (nonce + 'strict-dynamic', the strategy
//    Google/GitHub use) is the graduation target but is BLOCKED on Next 14:
//    the framework does not thread a request-header nonce into its own inline
//    scripts (verified against the production build — all framework script
//    tags ship bare; cf. vercel/next.js#95433). Reintroduce it behind a
//    Content-Security-Policy-Report-Only header after upgrading to a Next
//    version that applies nonces itself, then remove 'unsafe-inline' below.
const cspHeader = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://www.youtube.com https://s.ytimg.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
  `connect-src 'self'${isDev ? " http: ws:" : ""}`,
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

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
  { key: "Content-Security-Policy", value: cspHeader },
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
