// =============================================================================
// Nexus — app/api/auth/[...all]/route.ts
// Better Auth gestisce tutti i suoi endpoint sotto /api/auth/*
// =============================================================================

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);