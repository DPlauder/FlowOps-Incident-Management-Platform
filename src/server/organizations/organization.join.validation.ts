import type { JoinOrganizationInput } from "./organization.join.types";

const MAX_ORGANIZATION_ID_LENGTH = 100;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateJoinOrganizationInput(
  value: unknown,
): JoinOrganizationInput {
  if (!isRecord(value)) {
    throw new Error("Ungültige Anfrage.");
  }

  const { organizationId } = value;

  if (typeof organizationId !== "string") {
    throw new Error("Die Organisations-ID ist erforderlich.");
  }

  const normalizedOrganizationId = organizationId.trim();

  if (normalizedOrganizationId.length === 0) {
    throw new Error("Die Organisations-ID ist erforderlich.");
  }

  if (normalizedOrganizationId.length > MAX_ORGANIZATION_ID_LENGTH) {
    throw new Error("Die Organisations-ID ist ungültig.");
  }

  return {
    organizationId: normalizedOrganizationId,
  };
}