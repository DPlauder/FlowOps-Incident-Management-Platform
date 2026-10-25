import type { D1Database } from "@cloudflare/workers-types";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "../../lib/session";
import { getSafeUser } from "./session.service";
import type { SafeUser } from "../users/user.types";

export async function requireAuth(
  request: NextRequest,
  db: D1Database,
): Promise<SafeUser | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;

  return getSafeUser(db, token);
}
