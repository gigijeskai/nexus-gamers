// =============================================================================
// Nexus — app/api/auth/[...nextauth]/route.ts
// Esporta i handler GET e POST di Auth.js.
// Next.js instrada tutte le richieste /api/auth/* qui.
// =============================================================================

export { handlers as GET, handlers as POST } from "@/auth";

// Nota: "handlers" viene da NextAuth({ ... }) in auth.ts
// e contiene già la logica per /api/auth/signin, /callback, /signout etc.