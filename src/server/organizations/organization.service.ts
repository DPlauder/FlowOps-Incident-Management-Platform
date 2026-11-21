import type { D1Database } from "@cloudflare/workers-types";
import type {
  CreateOrganizationInput,
  CreatedOrganization,
} from "./organization.types";

export class OrganizationConflictError extends Error {
  constructor() {
    super("Die Organisation konnte nicht erstellt werden.");
    this.name = "OrganizationConflictError";
  }
}

function isOrganizationSlugConflict(error: unknown): boolean {
  return (
    error instanceof Error &&
    /unique constraint failed: organizations\.slug/i.test(error.message)
  );
}

export async function createOrganization(
  db: D1Database,
  userId: string,
  input: CreateOrganizationInput,
): Promise<CreatedOrganization> {
  const organizationId = crypto.randomUUID();
  const membershipId = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await db.batch([
      db
        .prepare(
          `INSERT INTO organizations (
            id,
            name,
            slug,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?)`,
        )
        .bind(
          organizationId,
          input.name,
          input.slug,
          now,
          now,
        ),

      db
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
          organizationId,
          userId,
          "OWNER",
          "ACTIVE",
          now,
          now,
        ),
    ]);
  } catch (error) {
    if (isOrganizationSlugConflict(error)) {
      throw new OrganizationConflictError();
    }

    throw error;
  }

  return {
    id: organizationId,
    name: input.name,
    slug: input.slug,
  };
}