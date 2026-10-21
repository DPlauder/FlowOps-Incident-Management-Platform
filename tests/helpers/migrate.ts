import type { D1Database } from "@cloudflare/workers-types";

// Lädt automatisch alle .sql-Dateien aus dem migrations-Ordner als Text
const migrationModules = import.meta.glob("../../migrations/*.sql", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export async function runMigrations(db: D1Database): Promise<void> {
  const sortedFiles = Object.keys(migrationModules).sort();

  for (const file of sortedFiles) {
    const rawSql = migrationModules[file];
    const normalizedSql = rawSql.replace(/\r\n/g, "\n");

    const statements = normalizedSql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await db.prepare(statement).run();
    }
  }
}