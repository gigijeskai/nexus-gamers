// =============================================================================
// Nexus — app/layout.tsx
// Root layout — obbligatorio in Next.js, deve contenere <html> e <body>
// =============================================================================

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus — Find your squad",
  description: "Reconnect with your gaming friends across every platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="dark">
      <body className="bg-slate-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}