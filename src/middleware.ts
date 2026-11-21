import { auth } from "@/lib/auth/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Neon Auth's built-in middleware handles session refresh and auth-route
// redirects. We layer our own admin-route protection on top.
const neonAuthMiddleware = auth.middleware({ loginUrl: "/auth/sign-in" });

export async function middleware(req: NextRequest) {
  const res = await neonAuthMiddleware(req);

  const url = req.nextUrl.clone();
  const isAdminRoute = url.pathname.startsWith("/admin");

  if (!isAdminRoute) return res;

  // Admin routes: require an admin session (server-side, cannot be bypassed).
  const { data: session } = await auth.getSession();
  const isAdminEmail = session?.user?.email
    ? ["daniele.buatti@gmail.com"].includes(session.user.email.toLowerCase())
    : false;

  if (!session || !isAdminEmail) {
    const target = session ? "/modules" : "/auth/sign-in";
    return NextResponse.redirect(new URL(target, url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|opengraph-image|api/auth|api/webhooks|api/analytics).*)"],
};
