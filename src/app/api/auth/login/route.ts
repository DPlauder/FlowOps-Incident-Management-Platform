import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import type { LoginInput } from "../../../../server/auth/login.types";
import { loginUser } from "../../../../server/auth/login.service";
import { setSessionCookie } from "../../../../server/auth/session.cookie";
import { validateLoginInput } from "../../../../server/auth/login.validation";
import { InvalidCredentialsError } from "../../../../server/auth/auth.errors";

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

  let input: LoginInput;

  try {
    input = validateLoginInput(body);
  } catch (error) {
    if (error instanceof Error) {
      return jsonError(error.message, 400);
    }

    console.error("Unbekannter Validierungsfehler beim Login:", error);
    return jsonError("Interner Serverfehler aufgetreten.", 500);
  }

  try {
    const authenticatedUser = await loginUser(env.flowops_db, input);

    const response = NextResponse.json(
      {
        id: authenticatedUser.id,
        email: authenticatedUser.email,
        displayName: authenticatedUser.displayName,
      },
      { status: 200 },
    );

    setSessionCookie(response, authenticatedUser.sessionToken);

    return response;
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return jsonError("Ungültige Anmeldedaten.", 401);
    }

    console.error("Login fehlgeschlagen:", error);
    return jsonError("Interner Serverfehler aufgetreten.", 500);
  }
}