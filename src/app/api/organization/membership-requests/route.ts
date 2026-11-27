import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { requireAuth } from "../../../../server/auth/require-auth";
import {
  approveOrganizationMembership,
  listPendingOrganizationMemberships,
  OrganizationMembershipAuthorizationError,
  OrganizationMembershipNotFoundError,
  OrganizationMembershipStateError,
  requireOrganizationAdminMembership,
} from "../../../../server/organizations/organization.membership.service";
import { validateApproveOrganizationMembershipInput } from "../../../../server/organizations/organization.membership.validation";
import type { ApproveOrganizationMembershipInput } from "../../../../server/organizations/organization.membership.types";


function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request): Promise<NextResponse> {
  const user = await requireAuth(request, env.flowops_db);

  if (!user) {
    return jsonError("Authentifizierung erforderlich.", 401);
  }

  const organizationId = new URL(request.url).searchParams.get(
    "organizationId",
  );

  if (!organizationId) {
    return jsonError("Eine Organisation ist erforderlich.", 400);
  }

  try {
    const context = await requireOrganizationAdminMembership(
      env.flowops_db,
      user.id,
      organizationId,
    );

    const memberships = await listPendingOrganizationMemberships(
      env.flowops_db,
      context,
    );

    return NextResponse.json({ items: memberships });
  } catch (error) {
    if (error instanceof OrganizationMembershipAuthorizationError) {
      return jsonError("Keine Berechtigung für diese Organisation.", 403);
    }

    console.error(
      "Offene Membership-Anfragen konnten nicht geladen werden:",
      error,
    );

    return jsonError("Interner Serverfehler aufgetreten.", 500);
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const user = await requireAuth(request, env.flowops_db);

  if (!user) {
    return jsonError("Authentifizierung erforderlich.", 401);
  }

  const organizationId = new URL(request.url).searchParams.get(
    "organizationId",
  );

  if (!organizationId) {
    return jsonError("Eine Organisation ist erforderlich.", 400);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Ungültige Anfrage.", 400);
  }

  let input: ApproveOrganizationMembershipInput;

  try {
    input = validateApproveOrganizationMembershipInput(body);
  } catch (error) {
    if (error instanceof Error) {
      return jsonError(error.message, 400);
    }

    console.error(
      "Unbekannter Validierungsfehler bei der Membership-Genehmigung:",
      error,
    );

    return jsonError("Interner Serverfehler aufgetreten.", 500);
  }

  try {
    const context = await requireOrganizationAdminMembership(
      env.flowops_db,
      user.id,
      organizationId,
    );

    const membership = await approveOrganizationMembership(
      env.flowops_db,
      context,
      input.membershipId,
    );

    return NextResponse.json(membership);
  } catch (error) {
    if (error instanceof OrganizationMembershipAuthorizationError) {
      return jsonError("Keine Berechtigung für diese Organisation.", 403);
    }

    if (error instanceof OrganizationMembershipNotFoundError) {
      return jsonError("Die Membership wurde nicht gefunden.", 404);
    }

    if (error instanceof OrganizationMembershipStateError) {
      return jsonError(
        "Die Membership kann in ihrem aktuellen Status nicht genehmigt werden.",
        409,
      );
    }

    console.error("Membership-Genehmigung fehlgeschlagen:", error);
    return jsonError("Interner Serverfehler aufgetreten.", 500);
  }
}