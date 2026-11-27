import type { D1Database } from "@cloudflare/workers-types";
import type {
  OrganizationAdminContext,
  OrganizationMembershipRole,
  OrganizationMembershipStatus,
  PendingOrganizationMembership,
  MembershipAuthorizationRecord,
  ApprovedOrganizationMembership
} from "./organization.membership.types";

export class OrganizationMembershipAuthorizationError extends Error {
  constructor() {
    super("Keine Berechtigung für diese Organisation.");
    this.name = "OrganizationMembershipAuthorizationError";
  }
}

export async function requireOrganizationAdminMembership(
  db: D1Database,
  userId: string,
  organizationId: string,
): Promise<OrganizationAdminContext> {
  const membership = await db
    .prepare(
      `SELECT organization_id, role, status
       FROM organization_members
       WHERE user_id = ?
         AND organization_id = ?`,
    )
    .bind(userId, organizationId)
    .first<MembershipAuthorizationRecord>();

  if (
    !membership ||
    membership.status !== "ACTIVE" ||
    (membership.role !== "OWNER" && membership.role !== "ADMIN")
  ) {
    throw new OrganizationMembershipAuthorizationError();
  }

  return {
    userId,
    organizationId: membership.organization_id,
    role: membership.role,
  };
}

export async function listPendingOrganizationMemberships(
  db: D1Database,
  context: OrganizationAdminContext,
): Promise<PendingOrganizationMembership[]> {
  const result = await db
    .prepare(
      `SELECT
         organization_members.id AS membership_id,
         organization_members.organization_id,
         organization_members.user_id,
         users.email,
         users.display_name,
         organization_members.role,
         organization_members.status,
         organization_members.created_at
       FROM organization_members
       INNER JOIN users
         ON users.id = organization_members.user_id
       WHERE organization_members.organization_id = ?
         AND organization_members.status = 'PENDING'
       ORDER BY organization_members.created_at ASC`,
    )
    .bind(context.organizationId)
    .all<{
      membership_id: string;
      organization_id: string;
      user_id: string;
      email: string;
      display_name: string;
      role: OrganizationMembershipRole;
      status: "PENDING";
      created_at: string;
    }>();

  return result.results.map((membership) => ({
    membershipId: membership.membership_id,
    organizationId: membership.organization_id,
    userId: membership.user_id,
    email: membership.email,
    displayName: membership.display_name,
    role: membership.role,
    status: membership.status,
    createdAt: membership.created_at,
  }));
}

export class OrganizationMembershipNotFoundError extends Error {
  constructor() {
    super("Die Membership wurde nicht gefunden.");
    this.name = "OrganizationMembershipNotFoundError";
  }
}

export class OrganizationMembershipStateError extends Error {
  constructor() {
    super("Die Membership kann in ihrem aktuellen Status nicht genehmigt werden.");
    this.name = "OrganizationMembershipStateError";
  }
}

export async function approveOrganizationMembership(
  db: D1Database,
  context: OrganizationAdminContext,
  membershipId: string,
): Promise<ApprovedOrganizationMembership> {
  const membership = await db
    .prepare(
      `SELECT id, organization_id, user_id, role, status
       FROM organization_members
       WHERE id = ?
         AND organization_id = ?`,
    )
    .bind(membershipId, context.organizationId)
    .first<{
      id: string;
      organization_id: string;
      user_id: string;
      role: OrganizationMembershipRole;
      status: OrganizationMembershipStatus;
    }>();

  if (!membership) {
    throw new OrganizationMembershipNotFoundError();
  }

  if (membership.status !== "PENDING") {
    throw new OrganizationMembershipStateError();
  }

  const now = new Date().toISOString();

  const result = await db
    .prepare(
      `UPDATE organization_members
       SET role = 'MEMBER',
           status = 'ACTIVE',
           updated_at = ?
       WHERE id = ?
         AND organization_id = ?
         AND status = 'PENDING'`,
    )
    .bind(now, membershipId, context.organizationId)
    .run();

  if (result.meta.changes !== 1) {
    throw new OrganizationMembershipStateError();
  }

  return {
    membershipId: membership.id,
    organizationId: membership.organization_id,
    userId: membership.user_id,
    role: "MEMBER",
    status: "ACTIVE",
  };
}