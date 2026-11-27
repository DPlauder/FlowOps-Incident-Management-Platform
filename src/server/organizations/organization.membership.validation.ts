import type { ApproveOrganizationMembershipInput } from "./organization.membership.types";

export function validateApproveOrganizationMembershipInput(
  value: unknown,
): ApproveOrganizationMembershipInput {
  if (typeof value !== "object" || value === null) {
    throw new Error("Ungültige Anfrage.");
  }

  const membershipId = (value as Record<string, unknown>).membershipId;

  if (typeof membershipId !== "string" || membershipId.trim().length === 0) {
    throw new Error("Eine Membership-ID ist erforderlich.");
  }

  return {
    membershipId: membershipId.trim(),
  };
}