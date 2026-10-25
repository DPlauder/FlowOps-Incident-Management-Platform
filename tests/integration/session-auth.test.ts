import { env } from "cloudflare:workers";
import { beforeAll, describe, expect, it } from "vitest";
import { POST as registerHandler } from "../../src/app/api/auth/register/route";
import { POST as loginHandler } from "../../src/app/api/auth/login/route";
import { hashSessionToken, SESSION_COOKIE_NAME } from "../../src/lib/session";
import { getSafeUser } from "../../src/server/auth/session.service";
import { runMigrations } from "../helpers/migrate";

function createJsonRequest(url: string, body: unknown): Request {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function getCookieValue(setCookie: string | null): string {
  expect(setCookie).toBeTruthy();
  const cookiePair = setCookie!.split(";")[0];
  const prefix = `${SESSION_COOKIE_NAME}=`;
  expect(cookiePair.startsWith(prefix)).toBe(true);
  return cookiePair.slice(prefix.length);
}

describe("getSafeUser", () => {
  beforeAll(async () => {
    await runMigrations(env.flowops_db);
  });

  it("gibt bei fehlendem oder ungültigem Token null zurück", async () => {
    expect(await getSafeUser(env.flowops_db, null)).toBeNull();
    expect(await getSafeUser(env.flowops_db, "ungueltiges-token")).toBeNull();
  });

  it("liefert den sicheren Benutzer für eine gültige Session", async () => {
    const email = `session-auth-${Date.now()}@flowops.dev`;
    const password = "SicheresPasswort123!";

    const registerResponse = await registerHandler(
      createJsonRequest("http://localhost/api/auth/register", {
        email,
        password,
        displayName: "Session Test",
      }),
    );
    expect(registerResponse.status).toBe(201);

    const loginResponse = await loginHandler(
      createJsonRequest("http://localhost/api/auth/login", {
        email,
        password,
      }),
    );
    expect(loginResponse.status).toBe(200);

    const token = getCookieValue(loginResponse.headers.get("set-cookie"));
    const user = await getSafeUser(env.flowops_db, token);

    expect(user).not.toBeNull();
    expect(user).toMatchObject({
      email,
      displayName: "Session Test",
    });
    expect(user).not.toHaveProperty("password_hash");
  });

  it("gibt für eine abgelaufene Session null zurück", async () => {
    const email = `expired-session-${Date.now()}@flowops.dev`;
    const password = "SicheresPasswort123!";

    const registerResponse = await registerHandler(
      createJsonRequest("http://localhost/api/auth/register", {
        email,
        password,
        displayName: "Expired Session",
      }),
    );
    expect(registerResponse.status).toBe(201);

    const loginResponse = await loginHandler(
      createJsonRequest("http://localhost/api/auth/login", {
        email,
        password,
      }),
    );
    expect(loginResponse.status).toBe(200);

    const token = getCookieValue(loginResponse.headers.get("set-cookie"));
    const sessionId = await hashSessionToken(token);

    await env.flowops_db
      .prepare("UPDATE sessions SET expires_at = ? WHERE id = ?")
      .bind("2000-01-01T00:00:00.000Z", sessionId)
      .run();

    expect(await getSafeUser(env.flowops_db, token)).toBeNull();
  });

  it("gibt für einen inaktiven Benutzer null zurück", async () => {
    const email = `inactive-session-${Date.now()}@flowops.dev`;
    const password = "SicheresPasswort123!";

    const registerResponse = await registerHandler(
      createJsonRequest("http://localhost/api/auth/register", {
        email,
        password,
        displayName: "Inactive Session",
      }),
    );
    expect(registerResponse.status).toBe(201);

    const loginResponse = await loginHandler(
      createJsonRequest("http://localhost/api/auth/login", {
        email,
        password,
      }),
    );
    expect(loginResponse.status).toBe(200);

    const token = getCookieValue(loginResponse.headers.get("set-cookie"));
    const sessionId = await hashSessionToken(token);

    await env.flowops_db
      .prepare(
        `UPDATE users
         SET is_active = 0
         WHERE id = (
           SELECT user_id FROM sessions WHERE id = ?
         )`,
      )
      .bind(sessionId)
      .run();

    expect(await getSafeUser(env.flowops_db, token)).toBeNull();
  });
});