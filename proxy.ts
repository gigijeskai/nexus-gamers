// =============================================================================
// Nexus — proxy.ts  (Next.js 16)
// Protegge /dashboard verificando la sessione Better Auth.
// Usa l'API di Better Auth invece di controllare il cookie direttamente
// perché il token è firmato e il nome può variare (http vs https).
// =============================================================================

import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/dashboard"];
const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isLogin = pathname === "/login";

  // Cerca il cookie di sessione con entrambi i possibili nomi
  const hasSessionCookie = SESSION_COOKIE_NAMES.some(
    (name) => !!request.cookies.get(name)?.value
  );

  if (isProtected && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }

  // Se loggato e tenta di andare al login, manda a dashboard
  if (isLogin && hasSessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};