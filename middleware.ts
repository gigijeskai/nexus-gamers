// =============================================================================
// Nexus — middleware.ts
// Importa da auth.config.ts (Edge-safe) — MAI da auth.ts (contiene Prisma).
// Gira nell'Edge Runtime di Next.js: nessun Node.js, nessun crypto.
// =============================================================================

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Crea un'istanza Auth.js leggera, solo con la config Edge-compatible.
// Nessun adapter, nessun Prisma — solo il controllo della sessione via cookie.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    /*
     * Intercetta tutte le route tranne:
     * - /api/auth/* (endpoint Auth.js stessi)
     * - /_next/ (asset Next.js)
     * - file statici con estensione
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};