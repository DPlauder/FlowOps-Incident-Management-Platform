import type { D1Database } from "@cloudflare/workers-types";
import { getSafeUser } from "./session.service";
import { readSessionToken } from "./session.cookie";
import type { SafeUser } from "../users/user.types";

export async function requireAuth(
  request: Request,
  db: D1Database,
): Promise<SafeUser | null> {
  const token = readSessionToken(request);

  return getSafeUser(db, token);
}