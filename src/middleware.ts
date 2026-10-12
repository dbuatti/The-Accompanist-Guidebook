import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Defensive fix for Neon Auth's hosted OAuth redirect: it occasionally emits
// the session verifier appended to the path with no '?' separator, e.g.
//   /welcomeneon_auth_session_verifier=...   (404s as a path)
// instead of
//   /welcome?neon_auth_session_verifier=...  (correct)
// Normalise it back into a query param so the sign-in/session-verifier flow
// works even if the remote service mangles the redirect URL.

// NOTE (CSP): strict `nonce`/`strict-dynamic` enforcement for the App Router
// is currently blocked by Next 14 not threading the nonce into its own inline
// hydration scripts (the pattern in nextjs.org/docs CSP + the x-nonce request
// header both leave framework scripts bare — cf. vercel/next.js#95433). We
// verified both mechanisms by curling a production build: all 32 framework
// script tags shipped without a nonce attribute. The enforced, cacheable
// baseline in next.config.js is the right posture for now; revisit strict
// nonces when the framework inserts them itself (Next 15+).
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const match = pathname.match(/^\/welcome(neon_auth_session_verifier=.*)$/);
  if (match) {
    const raw = match[1];
    const eq = raw.indexOf("=");
    const key = eq > -1 ? raw.slice(0, eq) : raw;
    const value = eq > -1 ? raw.slice(eq + 1) : "";
    if (key === "neon_auth_session_verifier" && value) {
      const url = request.nextUrl.clone();
      url.pathname = "/welcome";
      url.searchParams.set(key, value);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/welcome(.*)"],
};