import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { requireAuth } from "../../../../server/auth/require-auth";
import type { JoinOrganizationInput } from "../../../../server/organizations/organization.join.types";
import { validateJoinOrganizationInput } from "../../../../server/organizations/organization.join.validation";
import {
  OrganizationMembershipConflictError,
  OrganizationNotFoundError,
  requestOrganizationMembership,
} from "../../../../server/organizations/organization.join.service";

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

  let input: JoinOrganizationInput;

  try {
    input = validateJoinOrganizationInput(body);
  } catch (error) {
    if (error instanceof Error) {
      return jsonError(error.message, 400);
    }

    console.error(
      "Unbekannter Validierungsfehler bei der Beitrittsanfrage:",
      error,
    );

    return jsonError("Interner Serverfehler aufgetreten.", 500);
  }

  try {
    const membership = await requestOrganizationMembership(
      env.flowops_db,
      user.id,
      input,
    );

    return NextResponse.json(membership, { status: 201 });
  } catch (error) {
    if (error instanceof OrganizationNotFoundError) {
      return jsonError("Organisation wurde nicht gefunden.", 404);
    }

    if (error instanceof OrganizationMembershipConflictError) {
      return jsonError(
        "Für diese Organisation besteht bereits eine Membership.",
        409,
      );
    }

    console.error("Beitrittsanfrage fehlgeschlagen:", error);
    return jsonError("Interner Serverfehler aufgetreten.", 500);
  }
}