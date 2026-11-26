import { auth } from "@/lib/auth/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin";

// Only the admin area needs edge-level protection. Neon Auth's own
// `auth.middleware()` protects every matched route by default and would hide
// the public landing page, guides and free previews from anonymous visitors.
// Public/member pages handle their own access rules in the page and in the
// server actions they call.
export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { data: session } = await auth.getSession();

  if (!session || !isAdmin(session.user?.email)) {
    const target = session ? "/modules" : "/auth/sign-in";
    return NextResponse.redirect(new URL(target, url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
