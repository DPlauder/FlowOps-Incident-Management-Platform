import { env } from "cloudflare:workers";
import { beforeAll, describe, expect, it } from "vitest";
import { POST as registerHandler } from "../../src/app/api/auth/register/route";
import { POST as organizationHandler } from "../../src/app/api/organization/(create)/route";
import { SESSION_COOKIE_NAME } from "../../src/lib/session";
import { runMigrations } from "../helpers/migrate";

function createJsonRequest(
  url: string,
  body: unknown,
  cookie?: string,
): Request {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (cookie) {
    headers.set("Cookie", cookie);
  }

  return new Request(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}
async function responseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

function extractSessionCookie(response: Response): string {
  const setCookie = response.headers.get("set-cookie");

  expect(setCookie).toBeTruthy();

  const cookiePair = setCookie!.split(";")[0];
  const prefix = `${SESSION_COOKIE_NAME}=`;

  expect(cookiePair.startsWith(prefix)).toBe(true);

  return cookiePair;
}

async function registerTestUser(): Promise<string> {
  const email = `organization-${Date.now()}-${Math.random()}@flowops.dev`;

  const response = await registerHandler(
    createJsonRequest("http://localhost/api/auth/register", {
      email,
      password: "SuperSicheresPasswort123!",
      displayName: "Organization Test User",
    }),
  );

  expect(response.status).toBe(201);

  return extractSessionCookie(response);
}

describe("POST /api/organization", () => {
  beforeAll(async () => {
    await runMigrations(env.flowops_db);
  });

  it("erstellt eine Organisation und eine OWNER-Membership", async () => {
    const cookie = await registerTestUser();

    const response = await organizationHandler(
      createJsonRequest(
        "http://localhost/api/organization",
        {
          name: "Acme Operations",
        },
        cookie,
      ),
    );

    expect(response.status).toBe(201);

    const data = await responseJson<{
      id: string;
      name: string;
      slug: string;
    }>(response);

    expect(data.id).toBeTruthy();
    expect(data.name).toBe("Acme Operations");
    expect(data.slug).toBe("acme-operations");

    const organization = await env.flowops_db
      .prepare("SELECT id, name, slug FROM organizations WHERE id = ?")
      .bind(data.id)
      .first<{
        id: string;
        name: string;
        slug: string;
      }>();

    expect(organization).toEqual(data);

    const membership = await env.flowops_db
      .prepare(
        `SELECT organization_id, role, status
         FROM organization_members
         WHERE organization_id = ?`,
      )
      .bind(data.id)
      .first<{
        organization_id: string;
        role: string;
        status: string;
      }>();

    expect(membership).toMatchObject({
      organization_id: data.id,
      role: "OWNER",
      status: "ACTIVE",
    });
  }, 15_000);

  it("weist eine Anfrage ohne Session mit 401 ab", async () => {
    const response = await organizationHandler(
      createJsonRequest("http://localhost/api/organization", {
        name: "Unauthorized Organization",
      }),
    );

    expect(response.status).toBe(401);
  });

  it("weist einen ungültigen Organisationsnamen mit 400 ab", async () => {
    const cookie = await registerTestUser();

    const response = await organizationHandler(
      createJsonRequest(
        "http://localhost/api/organization",
        {
          name: "!!!",
        },
        cookie,
      ),
    );

    expect(response.status).toBe(400);
  });

  it("weist einen doppelten Slug mit 409 ab", async () => {
    const firstCookie = await registerTestUser();
    const secondCookie = await registerTestUser();

    const firstResponse = await organizationHandler(
      createJsonRequest(
        "http://localhost/api/organization",
        {
          name: "Duplicate Organization",
        },
        firstCookie,
      ),
    );

    expect(firstResponse.status).toBe(201);

    const secondResponse = await organizationHandler(
      createJsonRequest(
        "http://localhost/api/organization",
        {
          name: "Duplicate Organization",
        },
        secondCookie,
      ),
    );

    expect(secondResponse.status).toBe(409);
  }, 15_000);
});