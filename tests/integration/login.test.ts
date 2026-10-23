import { env } from "cloudflare:workers";
import { beforeAll, describe, expect, it } from "vitest";
import { POST as registerHandler } from "../../src/app/api/auth/register/route";
import { POST as loginHandler } from "../../src/app/api/auth/login/route";
import { SESSION_COOKIE_NAME } from "../../src/lib/session";
import { runMigrations } from "../helpers/migrate";

function createJsonRequest(url: string, body: unknown): Request {
  return new Request(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  beforeAll(async () => {
    await runMigrations(env.flowops_db);
  });

  it("meldet einen registrierten Benutzer erfolgreich an (Happy Path)", async () => {
    const email = `login-success-${Date.now()}@flowops.dev`;
    const password = "SicheresPasswort123!";
    const displayName = "Login User";

    // 1. Benutzer registrieren
    const regReq = createJsonRequest("http://localhost/api/auth/register", {
      email,
      password,
      displayName,
    });
    const regRes = await registerHandler(regReq);
    expect(regRes.status).toBe(201);

    // 2. Benutzer anmelden
    const loginReq = createJsonRequest("http://localhost/api/auth/login", {
      email,
      password,
    });
    const loginRes = await loginHandler(loginReq);

    // 3. Statuscode prüfen
    expect(loginRes.status).toBe(200);

    // 4. Response-Body prüfen
    const data = await loginRes.json<{
      id: string;
      email: string;
      displayName: string;
      password_hash?: unknown;
    }>();
    expect(data.id).toBeDefined();
    expect(data.email).toBe(email);
    expect(data.displayName).toBe(displayName);
    expect(data.password_hash).toBeUndefined();

    // 5. Session-Cookie prüfen
    const setCookie = loginRes.headers.get("set-cookie");
    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(setCookie?.toLowerCase()).toContain("httponly");
    expect(setCookie?.toLowerCase()).toContain("samesite=lax");

    // 6. Datenbank: Neue Session prüfen
    const dbSession = await env.flowops_db
      .prepare("SELECT * FROM sessions WHERE user_id = ?")
      .bind(data.id)
      .first<{ id: string; user_id: string }>();
    expect(dbSession).not.toBeNull();
    expect(dbSession?.user_id).toBe(data.id);
  }, 20_000);

  it("normalisiert die E-Mail-Adresse beim Login", async () => {
    const email = `normalize-login-${Date.now()}@flowops.dev`;
    const password = "SicheresPasswort123!";

    // Registrierung mit Kleinbuchstaben
    await registerHandler(
      createJsonRequest("http://localhost/api/auth/register", {
        email,
        password,
        displayName: "Normalize User",
      }),
    );

    // Login mit Großbuchstaben und Leerzeichen
    const loginReq = createJsonRequest("http://localhost/api/auth/login", {
      email: `  ${email.toUpperCase()}  `,
      password,
    });
    const loginRes = await loginHandler(loginReq);

    expect(loginRes.status).toBe(200);
    const data = await loginRes.json<{ email: string }>();
    expect(data.email).toBe(email);
  }, 20_000);

  it("weist ein falsches Passwort mit 401 ab", async () => {
    const email = `wrong-pwd-${Date.now()}@flowops.dev`;

    await registerHandler(
      createJsonRequest("http://localhost/api/auth/register", {
        email,
        password: "KorrektesPasswort123!",
        displayName: "Wrong Password User",
      }),
    );

    const loginReq = createJsonRequest("http://localhost/api/auth/login", {
      email,
      password: "FalschesPasswort999!",
    });
    const loginRes = await loginHandler(loginReq);

    expect(loginRes.status).toBe(401);
    const data = await loginRes.json<{ error: string }>();
    expect(data.error).toBe("Ungültige Anmeldedaten.");
  }, 20_000);

  it("weist eine nicht existierende E-Mail mit 401 und identischer Fehlermeldung ab", async () => {
    const loginReq = createJsonRequest("http://localhost/api/auth/login", {
      email: "gibt-es-nicht@flowops.dev",
      password: "IrgendeinPasswort123!",
    });
    const loginRes = await loginHandler(loginReq);

    expect(loginRes.status).toBe(401);
    const data = await loginRes.json<{ error: string }>();
    expect(data.error).toBe("Ungültige Anmeldedaten.");
  }, 10_000);

  it("weist einen inaktiven Benutzer mit 401 ab", async () => {
    const email = `inactive-${Date.now()}@flowops.dev`;
    const password = "SicheresPasswort123!";

    const regRes = await registerHandler(
      createJsonRequest("http://localhost/api/auth/register", {
        email,
        password,
        displayName: "Inactive User",
      }),
    );
    const regData = await regRes.json<{ id: string }>();

    // Benutzer in der Datenbank manuell auf inaktiv (0) setzen
    await env.flowops_db
      .prepare("UPDATE users SET is_active = 0 WHERE id = ?")
      .bind(regData.id)
      .run();

    const loginReq = createJsonRequest("http://localhost/api/auth/login", {
      email,
      password,
    });
    const loginRes = await loginHandler(loginReq);

    expect(loginRes.status).toBe(401);
    const data = await loginRes.json<{ error: string }>();
    expect(data.error).toBe("Ungültige Anmeldedaten.");
  }, 20_000);

  it("weist ungültige Anfragen mit 400 ab", async () => {
    const loginReq = createJsonRequest("http://localhost/api/auth/login", {
      email: "keine-email",
      password: "pass",
    });
    const loginRes = await loginHandler(loginReq);

    expect(loginRes.status).toBe(400);
    const data = await loginRes.json<{ error: string }>();
    expect(data.error).toBeDefined();
  });
});