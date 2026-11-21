import { env } from "cloudflare:workers";
import { beforeAll, describe, expect, it } from "vitest";
import { POST as createOrganizationHandler } from "../../src/app/api/organization/(create)/route";
import { POST as joinOrganizationHandler } from "../../src/app/api/organization/join/route";
import { POST as registerHandler } from "../../src/app/api/auth/register/route";
import { SESSION_COOKIE_NAME } from "../../src/lib/session";
import { runMigrations } from "../helpers/migrate";

type TestUser = {
  id: string;
  cookie: string;
};

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

async function registerTestUser(): Promise<TestUser> {
  const email = `join-${Date.now()}-${Math.random()}@flowops.dev`;

  const response = await registerHandler(
    createJsonRequest("http://localhost/api/auth/register", {
      email,
      password: "SuperSicheresPasswort123!",
      displayName: "Join Test User",
    }),
  );

  expect(response.status).toBe(201);

  const data = await responseJson<{ id: string }>(response);

  return {
    id: data.id,
    cookie: extractSessionCookie(response),
  };
}

async function createTestOrganization(cookie: string): Promise<string> {
  const response = await createOrganizationHandler(
    createJsonRequest(
      "http://localhost/api/organization",
      {
        name: `Join Test Organization ${Date.now()}-${Math.random()}`,
      },
      cookie,
    ),
  );

  expect(response.status).toBe(201);

  const data = await responseJson<{ id: string }>(response);

  return data.id;
}

describe("POST /api/organization/join", () => {
  beforeAll(async () => {
    await runMigrations(env.flowops_db);
  });

  it("legt eine PENDING-Membership mit der Rolle MEMBER an", async () => {
    const owner = await registerTestUser();
    const joiningUser = await registerTestUser();
    const organizationId = await createTestOrganization(owner.cookie);

    const response = await joinOrganizationHandler(
      createJsonRequest(
        "http://localhost/api/organization/join",
        { organizationId },
        joiningUser.cookie,
      ),
    );

    expect(response.status).toBe(201);

    const data = await responseJson<{
      organizationId: string;
      role: string;
      status: string;
    }>(response);

    expect(data).toEqual({
      organizationId,
      role: "MEMBER",
      status: "PENDING",
    });

    const membership = await env.flowops_db
      .prepare(
        `SELECT organization_id, user_id, role, status
         FROM organization_members
         WHERE organization_id = ?
           AND user_id = ?`,
      )
      .bind(organizationId, joiningUser.id)
      .first<{
        organization_id: string;
        user_id: string;
        role: string;
        status: string;
      }>();

    expect(membership).toEqual({
      organization_id: organizationId,
      user_id: joiningUser.id,
      role: "MEMBER",
      status: "PENDING",
    });
  }, 15_000);

  it("weist eine Anfrage ohne Session mit 401 ab", async () => {
    const owner = await registerTestUser();
    const organizationId = await createTestOrganization(owner.cookie);

    const response = await joinOrganizationHandler(
      createJsonRequest("http://localhost/api/organization/join", {
        organizationId,
      }),
    );

    expect(response.status).toBe(401);
  }, 15_000);

  it("weist eine nicht vorhandene Organisation mit 404 ab", async () => {
    const joiningUser = await registerTestUser();

    const response = await joinOrganizationHandler(
      createJsonRequest(
        "http://localhost/api/organization/join",
        {
          organizationId: crypto.randomUUID(),
        },
        joiningUser.cookie,
      ),
    );

    expect(response.status).toBe(404);
  }, 15_000);

  it("weist eine doppelte Membership mit 409 ab", async () => {
    const owner = await registerTestUser();
    const joiningUser = await registerTestUser();
    const organizationId = await createTestOrganization(owner.cookie);

    const firstResponse = await joinOrganizationHandler(
      createJsonRequest(
        "http://localhost/api/organization/join",
        { organizationId },
        joiningUser.cookie,
      ),
    );

    expect(firstResponse.status).toBe(201);

    const secondResponse = await joinOrganizationHandler(
      createJsonRequest(
        "http://localhost/api/organization/join",
        { organizationId },
        joiningUser.cookie,
      ),
    );

    expect(secondResponse.status).toBe(409);
  }, 15_000);

  it("kann Mitglied mehrerer Organisationen werden", async () => {
    const firstOwner = await registerTestUser();
    const secondOwner = await registerTestUser();
    const joiningUser = await registerTestUser();

    const firstOrganizationId = await createTestOrganization(firstOwner.cookie);
    const secondOrganizationId = await createTestOrganization(
      secondOwner.cookie,
    );

    const firstJoinResponse = await joinOrganizationHandler(
      createJsonRequest(
        "http://localhost/api/organization/join",
        { organizationId: firstOrganizationId },
        joiningUser.cookie,
      ),
    );

    const secondJoinResponse = await joinOrganizationHandler(
      createJsonRequest(
        "http://localhost/api/organization/join",
        { organizationId: secondOrganizationId },
        joiningUser.cookie,
      ),
    );

    expect(firstJoinResponse.status).toBe(201);
    expect(secondJoinResponse.status).toBe(201);

    const memberships = await env.flowops_db
      .prepare(
        `SELECT organization_id
         FROM organization_members
         WHERE user_id = ?
         ORDER BY organization_id`,
      )
      .bind(joiningUser.id)
      .all<{ organization_id: string }>();

    const organizationIds = memberships.results.map(
      (membership: { organization_id: string }) => membership.organization_id,
    );

    expect(organizationIds).toEqual(
      expect.arrayContaining([firstOrganizationId, secondOrganizationId]),
    );
  }, 20_000);
});