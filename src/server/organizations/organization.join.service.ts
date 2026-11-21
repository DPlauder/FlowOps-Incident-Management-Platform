import type { D1Database } from "@cloudflare/workers-types";
import type {
  JoinedOrganization,
  JoinOrganizationInput,
} from "./organization.join.types";

export class OrganizationNotFoundError extends Error {
  constructor() {
    super("Organisation wurde nicht gefunden.");
    this.name = "OrganizationNotFoundError";
  }
}

export class OrganizationMembershipConflictError extends Error {
  constructor() {
    super("Für diesen Benutzer besteht bereits eine Membership.");
    this.name = "OrganizationMembershipConflictError";
  }
}

function isMembershipUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Error &&
    /unique constraint failed: organization_members/i.test(error.message)
  );
}

export async function requestOrganizationMembership(
  db: D1Database,
  userId: string,
  input: JoinOrganizationInput,
): Promise<JoinedOrganization> {
  const organization = await db
    .prepare("SELECT id FROM organizations WHERE id = ?")
    .bind(input.organizationId)
    .first<{ id: string }>();

  if (!organization) {
    throw new OrganizationNotFoundError();
  }

  const existingMembership = await db
    .prepare(
      `SELECT id, status
       FROM organization_members
       WHERE organization_id = ?
         AND user_id = ?`,
    )
    .bind(input.organizationId, userId)
    .first<{ id: string; status: string }>();

  if (existingMembership) {
    throw new OrganizationMembershipConflictError();
  }

  const membershipId = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await db
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
        membershipId,
        organization.id,
        userId,
        "MEMBER",
        "PENDING",
        now,
        now,
      )
      .run();
  } catch (error) {
    if (isMembershipUniqueConstraintError(error)) {
      throw new OrganizationMembershipConflictError();
    }

    throw error;
  }

  return {
    organizationId: organization.id,
    role: "MEMBER",
    status: "PENDING",
  };
}