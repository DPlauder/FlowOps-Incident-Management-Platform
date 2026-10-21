import { env } from "cloudflare:workers";
import { beforeAll, describe, expect, it } from "vitest";
import { POST } from "../../src/app/api/auth/register/route";
import { SESSION_COOKIE_NAME } from "../../src/lib/session";
import schemaSql from "../../migrations/0001_initial_schema.sql?raw";

function createJsonRequest(body: unknown): Request {
  
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}


describe("POST /api/auth/register", () => {
    beforeAll(async () => {
    const normalizedSql = schemaSql.replace(/\r\n/g, "\n");
    // Aufteilen in einzelne Statements und leere Einträge ignorieren
    const statements = normalizedSql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await env.flowops_db.prepare(statement).run();
    }
  });

  it("erstellt einen neuen Benutzer und eine Session (Happy Path)", async () => {
    const email = `test-${Date.now()}@flowops.dev`;
    const password = "SuperSicheresPasswort123!";
    const displayName = "Max Mustermann";

    const request = createJsonRequest({ email, password, displayName });
    const response = await POST(request);

    // 1. Statuscode prüfen
    expect(response.status).toBe(201);

    // 2. Response-Body prüfen
    const data = await response.json<{ id: string; email: string; displayName: string; password_hash?: unknown }>();
    expect(data.id).toBeDefined();
    expect(data.email).toBe(email);
    expect(data.displayName).toBe(displayName);
    expect(data.password_hash).toBeUndefined(); // Niemals das Passwort zurückgeben!

    // 3. Cookie prüfen
    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(setCookie?.toLowerCase()).toContain("httponly");
    expect(setCookie?.toLowerCase()).toContain("samesite=lax");

    // 4. Datenbank: User prüfen
    const dbUser = await env.flowops_db
      .prepare("SELECT * FROM users WHERE id = ?")
      .bind(data.id)
      .first<{ id: string; email: string; display_name: string; is_active: number }>();

    expect(dbUser).not.toBeNull();
    expect(dbUser?.email).toBe(email);
    expect(dbUser?.display_name).toBe(displayName);
    expect(dbUser?.is_active).toBe(1);

    // 5. Datenbank: Session prüfen
    const dbSession = await env.flowops_db
      .prepare("SELECT * FROM sessions WHERE user_id = ?")
      .bind(data.id)
      .first<{ id: string; user_id: string }>();

    expect(dbSession).not.toBeNull();
    expect(dbSession?.user_id).toBe(data.id);

    // 6. Keine Organisation angelegt
    const member = await env.flowops_db
      .prepare("SELECT * FROM organization_members WHERE user_id = ?")
      .bind(data.id)
      .first();
    expect(member).toBeNull();
  }, 15_000);

  it("normalisiert die E-Mail-Adresse (Kleinbuchstaben und Leerzeichen)", async () => {
    const rawEmail = `  Normalize-${Date.now()}@FlowOps.DEV  `;
    const expectedEmail = rawEmail.trim().toLowerCase();

    const request = createJsonRequest({
      email: rawEmail,
      password: "SuperSicheresPasswort123!",
      displayName: "Normalize User",
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const data = await response.json<{ email: string }>();
    expect(data.email).toBe(expectedEmail);

    const dbUser = await env.flowops_db
      .prepare("SELECT email FROM users WHERE email = ?")
      .bind(expectedEmail)
      .first<{ email: string }>();

    expect(dbUser?.email).toBe(expectedEmail);
  }, 15_000);

  it("weist ein zu kurzes Passwort ab (< 12 Zeichen)", async () => {
    const request = createJsonRequest({
      email: `short-${Date.now()}@flowops.dev`,
      password: "kurz",
      displayName: "Short Password User",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json<{ error: string }>();
    expect(data.error).toBeDefined();
  });

  it("weist doppelte E-Mail-Adressen mit generischer Fehlermeldung ab", async () => {
    const email = `duplicate-${Date.now()}@flowops.dev`;

    // Erste Registrierung
    const req1 = createJsonRequest({
      email,
      password: "SuperSicheresPasswort123!",
      displayName: "First User",
    });
    const res1 = await POST(req1);
    expect(res1.status).toBe(201);

    // Zweite Registrierung mit gleicher E-Mail (aber anderer Schreibung)
    const req2 = createJsonRequest({
      email: email.toUpperCase(),
      password: "AnderesPasswort123!",
      displayName: "Second User",
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(400);

    const data = await responseJson<{ error: string }>(res2);
    expect(data.error).toBe("Registrierung konnte nicht durchgeführt werden.");
  }, 20_000);
});

async function responseJson<T>(res: Response): Promise<T> {
  return res.json() as Promise<T>;
}