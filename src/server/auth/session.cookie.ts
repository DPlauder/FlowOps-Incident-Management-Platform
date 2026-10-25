import type { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "../../lib/session";

const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export function setSessionCookie(
  response: NextResponse,
  sessionToken: string,
): void {
  const isProduction = process.env.NODE_ENV === "production";

  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export function clearSessionCookie(response: NextResponse): void {
  const isProduction = process.env.NODE_ENV === "production";
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  });
}