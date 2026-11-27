import { env } from "cloudflare:workers";
import { expect } from "vitest";
import { POST as createOrganizationHandler } from "../../src/app/api/organization/(create)/route";
import { POST as joinOrganizationHandler } from "../../src/app/api/organization/join/route";
import { POST as registerHandler } from "../../src/app/api/auth/register/route";
import { SESSION_COOKIE_NAME } from "../../src/lib/session";

export type TestUser = {
  id: string;
  cookie: string;
};

export function createJsonRequest(
  url: string,
  method: RequestInit["method"],
  body?: unknown,
  cookie?: string,
): Request {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (cookie) {
    headers.set("Cookie", cookie);
  }

  return new Request(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function responseJson<T>(response: Response): Promise<T> {
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

export async function registerTestUser(
  displayName = "Membership Test User",
): Promise<TestUser> {
  const email = `membership-${Date.now()}-${Math.random()}@flowops.dev`;

  const response = await registerHandler(
    createJsonRequest(
      "http://localhost/api/auth/register",
      "POST",
      {
        email,
        password: "SuperSicheresPasswort123!",
        displayName,
      },
    ),
  );

  expect(response.status).toBe(201);

  const data = await responseJson<{ id: string }>(response);

  return {
    id: data.id,
    cookie: extractSessionCookie(response),
  };
}

export async function createTestOrganization(
  ownerCookie: string,
): Promise<string> {
  const response = await createOrganizationHandler(
    createJsonRequest(
      "http://localhost/api/organization",
      "POST",
      {
        name: `Membership Test Organization ${Date.now()}-${Math.random()}`,
      },
      ownerCookie,
    ),
  );

  expect(response.status).toBe(201);

  const data = await responseJson<{ id: string }>(response);

  return data.id;
}

export async function requestMembership(
  organizationId: string,
  joiningUser: TestUser,
): Promise<string> {
  const response = await joinOrganizationHandler(
    createJsonRequest(
      "http://localhost/api/organization/join",
      "POST",
      { organizationId },
      joiningUser.cookie,
    ),
  );

  expect(response.status).toBe(201);

  const membership = await env.flowops_db
    .prepare(
      `SELECT id
       FROM organization_members
       WHERE organization_id = ?
         AND user_id = ?`,
    )
    .bind(organizationId, joiningUser.id)
    .first<{ id: string }>();

  expect(membership).toBeTruthy();

  return membership!.id;
}

export async function createAdminMembership(
  organizationId: string,
  userId: string,
): Promise<void> {
  const now = new Date().toISOString();

  await env.flowops_db
    .prepare(
      `INSERT INTO organization_members (
        id,
        organization_id,
        user_id,
        role,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      organizationId,
      userId,
      "ADMIN",
      "ACTIVE",
      now,
      now,
    )
    .run();
}