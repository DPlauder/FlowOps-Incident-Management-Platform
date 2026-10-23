import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import type { RegisterInput } from "../../../../server/auth/register.types";
import {registerUser} from "../../../../server/auth/register.service";
import { setSessionCookie } from "../../../../server/auth/session.cookie";
import { validateRegisterInput } from "../../../../server/auth/register.validation";
import { RegistrationConflictError } from "../../../../server/auth/auth.errors";

function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Ungültige Anfrage", 400);
  }

  let input: RegisterInput;

  try {
    input = validateRegisterInput(body);
  } catch (error) {
    if (error instanceof Error) {
      return jsonError(error.message, 400);
    }

    console.error("Unbekannter Validierungsfehler bei der Registrierung:", error);
    return jsonError("Interner Serverfehler aufgetreten.", 500);
  }

  try {
    const registeredUser = await registerUser(env.flowops_db, input);

    const response = NextResponse.json(
      {
        id: registeredUser.id,
        email: registeredUser.email,
        displayName: registeredUser.displayName,
      },
      { status: 201 },
    );

    setSessionCookie(response, registeredUser.sessionToken);

    return response;
  } catch (error) {
    if (error instanceof RegistrationConflictError) {
      return jsonError(
        "Registrierung konnte nicht durchgeführt werden.",
        400,
      );
    }

    console.error("Registrierung fehlgeschlagen:", error);
    return jsonError("Interner Serverfehler aufgetreten.", 500);
  }
}