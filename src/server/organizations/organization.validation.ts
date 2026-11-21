import type { CreateOrganizationInput } from "./organization.types";

const MAX_ORGANIZATION_NAME_LENGTH = 100;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function createOrganizationSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateCreateOrganizationInput(
  value: unknown,
): CreateOrganizationInput {
  if (!isRecord(value)) {
    throw new Error("Ungültige Anfrage");
  }

  const { name } = value;

  if (typeof name !== "string") {
    throw new Error("Der Organisationsname ist erforderlich.");
  }

  const normalizedName = name.trim();

  if (normalizedName.length === 0) {
    throw new Error("Der Organisationsname ist erforderlich.");
  }

  if (normalizedName.length > MAX_ORGANIZATION_NAME_LENGTH) {
    throw new Error(
      "Der Organisationsname darf höchstens 100 Zeichen enthalten.",
    );
  }

  const slug = createOrganizationSlug(normalizedName);

  if (slug.length === 0) {
    throw new Error(
      "Der Organisationsname muss mindestens ein gültiges Zeichen enthalten.",
    );
  }

  return {
    name: normalizedName,
    slug,
  };
}