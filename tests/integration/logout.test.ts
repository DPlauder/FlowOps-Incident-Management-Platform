import { env } from "cloudflare:workers";
import { beforeAll, describe, expect, it } from "vitest";
import { POST as registerHandler } from "../../src/app/api/auth/register/route";
import { POST as loginHandler } from "../../src/app/api/auth/login/route";
import { POST as logoutHandler } from "../../src/app/api/auth/logout/route";
import {
  hashSessionToken,
  SESSION_COOKIE_NAME,
} from "../../src/lib/session";
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

function getCookieValue(setCookie: string | null): string {
  expect(setCookie).toBeTruthy();

  const cookiePair = setCookie!.split(";")[0];
  const prefix = `${SESSION_COOKIE_NAME}=`;

  expect(cookiePair.startsWith(prefix)).toBe(true);
  return cookiePair.slice(prefix.length);
}

describe("POST /api/auth/logout", () => {
  beforeAll(async () => {
    await runMigrations(env.flowops_db);
  });

  it("löscht die Session und lässt den Cookie ablaufen", async () => {
    const email = `logout-${Date.now()}@flowops.dev`;
    const password = "SicheresPasswort123!";

    const registerResponse = await registerHandler(
      createJsonRequest("http://localhost/api/auth/register", {
        email,
        password,
        displayName: "Logout User",
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

    const sessionBeforeLogout = await env.flowops_db
      .prepare("SELECT id FROM sessions WHERE id = ?")
      .bind(sessionId)
      .first<{ id: string }>();
    expect(sessionBeforeLogout).not.toBeNull();

    const logoutRequest = new Request("http://localhost/api/auth/logout", {
      method: "POST",
      headers: {
        Cookie: `${SESSION_COOKIE_NAME}=${token}`,
      },
    });

    const logoutResponse = await logoutHandler(logoutRequest);

    expect(logoutResponse.status).toBe(200);
    expect(await logoutResponse.json()).toEqual({
      message: "Erfolgreich abgemeldet",
    });

    const setCookie = logoutResponse.headers.get("set-cookie");
    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(setCookie?.toLowerCase()).toContain("max-age=0");

    const sessionAfterLogout = await env.flowops_db
      .prepare("SELECT id FROM sessions WHERE id = ?")
      .bind(sessionId)
      .first<{ id: string }>();
    expect(sessionAfterLogout).toBeNull();
  }, 20_000);

  it("meldet auch ohne Session-Cookie erfolgreich ab", async () => {
    const logoutResponse = await logoutHandler(
      new Request("http://localhost/api/auth/logout", {
        method: "POST",
      }),
    );

    expect(logoutResponse.status).toBe(200);
    expect(await logoutResponse.json()).toEqual({
      message: "Erfolgreich abgemeldet",
    });

    const setCookie = logoutResponse.headers.get("set-cookie");
    expect(setCookie).toBeTruthy();
    expect(setCookie?.toLowerCase()).toContain("max-age=0");
  });
});
