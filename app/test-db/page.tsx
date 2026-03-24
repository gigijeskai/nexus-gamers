// =============================================================================
// Nexus — app/test-db/page.tsx
// Pagina di test per verificare la connessione DB e i dati del seed.
// DA RIMUOVERE prima di andare in produzione.
// =============================================================================

import { getAllUsersWithStatus } from "@/lib/db/queries";

export default async function TestDbPage() {
  const users = await getAllUsersWithStatus();

  return (
    <main style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>🧪 Test DB — Nexus</h1>
      <p>
        Utenti trovati: <strong>{users.length}</strong>
      </p>

      {users.map((user) => (
        <section
          key={user.id}
          style={{
            marginBottom: "2rem",
            borderLeft: "3px solid #7F77DD",
            paddingLeft: "1rem",
          }}
        >
          <h2>
            {user.nexusTag}
            <span
              style={{
                marginLeft: "0.75rem",
                fontSize: "0.8rem",
                color:
                  user.status?.status === "ONLINE"
                    ? "green"
                    : user.status?.status === "IN_GAME"
                    ? "orange"
                    : "gray",
              }}
            >
              {user.status?.status ?? "NO STATUS"}
              {user.status?.currentGame ? ` — ${user.status.currentGame}` : ""}
            </span>
          </h2>

          <pre
            style={{
              background: "#1e1e1e",
              color: "#d4d4d4",
              padding: "1rem",
              borderRadius: "6px",
              overflowX: "auto",
              fontSize: "0.8rem",
            }}
          >
            {JSON.stringify(user, null, 2)}
          </pre>
        </section>
      ))}
    </main>
  );
}