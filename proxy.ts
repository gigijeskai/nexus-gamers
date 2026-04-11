// =============================================================================
// Nexus — proxy.ts  (Next.js 16)
//
// Il proxy fa UN solo check: c'è un cookie di sessione?
//
// La logica dell'onboarding (nexusTag null → redirect /onboarding) è gestita
// da dashboard/layout.tsx che gira in Node.js e ha accesso alla sessione reale.
// Il proxy non può interrogare il DB (Edge Runtime), quindi delega quella
// responsabilità al layout.
//
// Flusso:
//   Nessun cookie + /dashboard  → redirect /login
//   Cookie OK     + /login      → redirect /dashboard
//   Cookie OK     + /dashboard  → passa (il layout gestisce l'onboarding gate)
//   Nessun cookie + /onboarding → redirect /login
//   Tutto il resto               → passa
// =============================================================================

import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

function hasSession(request: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => !!request.cookies.get(name)?.value);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const loggedIn     = hasSession(request);

  const isDashboard  = pathname.startsWith("/dashboard");
  const isOnboarding = pathname === "/onboarding";
  const isLogin      = pathname === "/login";
  const isAuthApi    = pathname.startsWith("/api/auth");

  // Mai interferire con gli endpoint di Better Auth
  if (isAuthApi) return NextResponse.next();

  // Utente NON loggato: blocca dashboard e onboarding
  if (!loggedIn && (isDashboard || isOnboarding)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.href);
    return NextResponse.redirect(url);
  }

  // Utente loggato sul login → manda al dashboard
  if (loggedIn && isLogin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};