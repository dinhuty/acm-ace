import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

// Public paths reachable without a session. Everything else requires one.
const PUBLIC_PATHS = ["/login", "/register"];

// Optimistic check only: presence of the session cookie. The real DB-backed
// verification happens in the DAL (see lib/auth/dal.ts) used by the (app)
// layout and every Server Action. Auth pages self-redirect authenticated
// users, so we don't redirect authed users here (avoids loops on stale cookies).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!isPublic && !hasSession) {
    const loginUrl = new URL("/login", request.nextUrl);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Skip API, Next internals, and any static file (has a "." — icon.svg,
  // logo.svg, favicon.ico, images) so metadata icons aren't auth-redirected.
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
