import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { requireAuth } from "../../../../server/auth/require-auth";
import {
  createOrganization,
  OrganizationConflictError,
} from "../../../../server/organizations/organization.service";
import { validateCreateOrganizationInput } from "../../../../server/organizations/organization.validation";

function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request): Promise<NextResponse> {
  const user = await requireAuth(request, env.flowops_db);

  if (!user) {
    return jsonError("Authentifizierung erforderlich.", 401);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Ungültige Anfrage.", 400);
  }

  let input;

  try {
    input = validateCreateOrganizationInput(body);
  } catch (error) {
    if (error instanceof Error) {
      return jsonError(error.message, 400);
    }

    console.error(
      "Unbekannter Validierungsfehler bei der Organisationserstellung:",
      error,
    );

    return jsonError("Interner Serverfehler aufgetreten.", 500);
  }

  try {
    const organization = await createOrganization(
      env.flowops_db,
      user.id,
      input,
    );

    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    if (error instanceof OrganizationConflictError) {
      return jsonError(
        "Eine Organisation mit diesem Namen existiert bereits.",
        409,
      );
    }

    console.error("Organisationserstellung fehlgeschlagen:", error);
    return jsonError("Interner Serverfehler aufgetreten.", 500);
  }
}