import { env } from "cloudflare:workers";
import { beforeAll, describe, expect, it } from "vitest";
import {
  GET as getMembershipRequestsHandler,
  PATCH as approveMembershipHandler,
} from "../../src/app/api/organization/membership-requests/route";
import { runMigrations } from "../helpers/migrate";
import {
  createAdminMembership,
  createJsonRequest,
  createTestOrganization,
  registerTestUser,
  requestMembership,
  responseJson,
} from "../helpers/membership-request";

describe("Membership-Anfragen", () => {
  beforeAll(async () => {
    await runMigrations(env.flowops_db);
  });

  it("OWNER kann offene Anfragen der eigenen Organisation anzeigen", async () => {
    const owner = await registerTestUser("Organization Owner");
    const joiningUser = await registerTestUser("Joining User");
    const organizationId = await createTestOrganization(owner.cookie);

    const membershipId = await requestMembership(
      organizationId,
      joiningUser,
    );

    const response = await getMembershipRequestsHandler(
      new Request(
        `http://localhost/api/organization/membership-requests?organizationId=${organizationId}`,
        {
          method: "GET",
          headers: {
            Cookie: owner.cookie,
          },
        },
      ),
    );

    expect(response.status).toBe(200);

    const data = await responseJson<{
      items: Array<{
        membershipId: string;
        organizationId: string;
        userId: string;
        role: string;
        status: string;
      }>;
    }>(response);

    expect(data.items).toContainEqual(
      expect.objectContaining({
        membershipId,
        organizationId,
        userId: joiningUser.id,
        role: "MEMBER",
        status: "PENDING",
      }),
    );
  });

  it("weist einen MEMBER mit 403 ab", async () => {
    const owner = await registerTestUser("Organization Owner");
    const member = await registerTestUser("Organization Member");
    const organizationId = await createTestOrganization(owner.cookie);

    await requestMembership(organizationId, member);

    const response = await getMembershipRequestsHandler(
      new Request(
        `http://localhost/api/organization/membership-requests?organizationId=${organizationId}`,
        {
          method: "GET",
          headers: {
            Cookie: member.cookie,
          },
        },
      ),
    );

    expect(response.status).toBe(403);
  });

  it("OWNER kann eine PENDING-Membership genehmigen", async () => {
    const owner = await registerTestUser("Organization Owner");
    const joiningUser = await registerTestUser("Joining User");
    const organizationId = await createTestOrganization(owner.cookie);

    const membershipId = await requestMembership(
      organizationId,
      joiningUser,
    );

    const response = await approveMembershipHandler(
      createJsonRequest(
        `http://localhost/api/organization/membership-requests?organizationId=${organizationId}`,
        "PATCH",
        { membershipId },
        owner.cookie,
      ),
    );

    expect(response.status).toBe(200);

    const membership = await env.flowops_db
      .prepare(
        `SELECT role, status
         FROM organization_members
         WHERE id = ?`,
      )
      .bind(membershipId)
      .first<{ role: string; status: string }>();

    expect(membership).toEqual({
      role: "MEMBER",
      status: "ACTIVE",
    });
  });

  it("ADMIN kann offene Anfragen der eigenen Organisation anzeigen", async () => {
    const owner = await registerTestUser("Organization Owner");
    const admin = await registerTestUser("Organization Admin");
    const joiningUser = await registerTestUser("Joining User");
    const organizationId = await createTestOrganization(owner.cookie);

    await createAdminMembership(organizationId, admin.id);

    const membershipId = await requestMembership(
      organizationId,
      joiningUser,
    );

    const response = await getMembershipRequestsHandler(
      new Request(
        `http://localhost/api/organization/membership-requests?organizationId=${organizationId}`,
        {
          method: "GET",
          headers: {
            Cookie: admin.cookie,
          },
        },
      ),
    );

    expect(response.status).toBe(200);

    const data = await responseJson<{
      items: Array<{
        membershipId: string;
        organizationId: string;
        userId: string;
        role: string;
        status: string;
      }>;
    }>(response);

    expect(data.items).toContainEqual(
      expect.objectContaining({
        membershipId,
        organizationId,
        userId: joiningUser.id,
        role: "MEMBER",
        status: "PENDING",
      }),
    );
  });

  it("ADMIN kann eine PENDING-Membership genehmigen", async () => {
    const owner = await registerTestUser("Organization Owner");
    const admin = await registerTestUser("Organization Admin");
    const joiningUser = await registerTestUser("Joining User");
    const organizationId = await createTestOrganization(owner.cookie);

    await createAdminMembership(organizationId, admin.id);

    const membershipId = await requestMembership(
      organizationId,
      joiningUser,
    );

    const response = await approveMembershipHandler(
      createJsonRequest(
        `http://localhost/api/organization/membership-requests?organizationId=${organizationId}`,
        "PATCH",
        { membershipId },
        admin.cookie,
      ),
    );

    expect(response.status).toBe(200);

    const membership = await env.flowops_db
      .prepare(
        `SELECT role, status
         FROM organization_members
         WHERE id = ?`,
      )
      .bind(membershipId)
      .first<{ role: string; status: string }>();

    expect(membership).toEqual({
      role: "MEMBER",
      status: "ACTIVE",
    });
  });

  it("weist den Zugriff auf Membership-Anfragen einer fremden Organisation ab", async () => {
    const firstOwner = await registerTestUser("First Organization Owner");
    const secondOwner = await registerTestUser("Second Organization Owner");
    const joiningUser = await registerTestUser("Joining User");

    const firstOrganizationId = await createTestOrganization(
      firstOwner.cookie,
    );

    await createTestOrganization(secondOwner.cookie);

    await requestMembership(
      firstOrganizationId,
      joiningUser,
    );

    const response = await getMembershipRequestsHandler(
      new Request(
        `http://localhost/api/organization/membership-requests?organizationId=${firstOrganizationId}`,
        {
          method: "GET",
          headers: {
            Cookie: secondOwner.cookie,
          },
        },
      ),
    );

    expect(response.status).toBe(403);
  });

  it("weist die Genehmigung einer Membership aus einer fremden Organisation ab", async () => {
    const firstOwner = await registerTestUser("First Organization Owner");
    const secondOwner = await registerTestUser("Second Organization Owner");
    const joiningUser = await registerTestUser("Joining User");

    const firstOrganizationId = await createTestOrganization(
      firstOwner.cookie,
    );

    await createTestOrganization(secondOwner.cookie);

    const membershipId = await requestMembership(
      firstOrganizationId,
      joiningUser,
    );

    const response = await approveMembershipHandler(
      createJsonRequest(
        `http://localhost/api/organization/membership-requests?organizationId=${firstOrganizationId}`,
        "PATCH",
        { membershipId },
        secondOwner.cookie,
      ),
    );

    expect(response.status).toBe(403);

    const membership = await env.flowops_db
      .prepare(
        `SELECT role, status
         FROM organization_members
         WHERE id = ?`,
      )
      .bind(membershipId)
      .first<{ role: string; status: string }>();

    expect(membership).toEqual({
      role: "MEMBER",
      status: "PENDING",
    });
  });

  it("weist die erneute Genehmigung einer ACTIVE-Membership mit 409 ab", async () => {
    const owner = await registerTestUser("Organization Owner");
    const joiningUser = await registerTestUser("Joining User");
    const organizationId = await createTestOrganization(owner.cookie);

    const membershipId = await requestMembership(
      organizationId,
      joiningUser,
    );

    const firstResponse = await approveMembershipHandler(
      createJsonRequest(
        `http://localhost/api/organization/membership-requests?organizationId=${organizationId}`,
        "PATCH",
        { membershipId },
        owner.cookie,
      ),
    );

    expect(firstResponse.status).toBe(200);

    const secondResponse = await approveMembershipHandler(
      createJsonRequest(
        `http://localhost/api/organization/membership-requests?organizationId=${organizationId}`,
        "PATCH",
        { membershipId },
        owner.cookie,
      ),
    );

    expect(secondResponse.status).toBe(409);

    const membership = await env.flowops_db
      .prepare(
        `SELECT role, status
         FROM organization_members
         WHERE id = ?`,
      )
      .bind(membershipId)
      .first<{ role: string; status: string }>();

    expect(membership).toEqual({
      role: "MEMBER",
      status: "ACTIVE",
    });
  });

  it("weist eine nicht vorhandene Membership mit 404 ab", async () => {
    const owner = await registerTestUser("Organization Owner");
    const organizationId = await createTestOrganization(owner.cookie);

    const response = await approveMembershipHandler(
      createJsonRequest(
        `http://localhost/api/organization/membership-requests?organizationId=${organizationId}`,
        "PATCH",
        {
          membershipId: crypto.randomUUID(),
        },
        owner.cookie,
      ),
    );

    expect(response.status).toBe(404);
  });

  it("weist eine GET-Anfrage ohne organizationId mit 400 ab", async () => {
    const owner = await registerTestUser("Organization Owner");

    const response = await getMembershipRequestsHandler(
      new Request(
        "http://localhost/api/organization/membership-requests",
        {
          method: "GET",
          headers: {
            Cookie: owner.cookie,
          },
        },
      ),
    );

    expect(response.status).toBe(400);
  });

  it("weist eine PATCH-Anfrage ohne organizationId mit 400 ab", async () => {
    const owner = await registerTestUser("Organization Owner");

    const response = await approveMembershipHandler(
      createJsonRequest(
        "http://localhost/api/organization/membership-requests",
        "PATCH",
        {
          membershipId: crypto.randomUUID(),
        },
        owner.cookie,
      ),
    );

    expect(response.status).toBe(400);
  });

  it("weist eine PATCH-Anfrage ohne membershipId mit 400 ab", async () => {
    const owner = await registerTestUser("Organization Owner");
    const organizationId = await createTestOrganization(owner.cookie);

    const response = await approveMembershipHandler(
      createJsonRequest(
        `http://localhost/api/organization/membership-requests?organizationId=${organizationId}`,
        "PATCH",
        {},
        owner.cookie,
      ),
    );

    expect(response.status).toBe(400);
  });
});