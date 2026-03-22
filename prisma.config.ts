import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    // DIRECT_URL = connessione diretta porta 5432, senza pooler
    // Il CLI (db push, migrate) la usa per i DDL
    url: env("DIRECT_URL"),
  },
});