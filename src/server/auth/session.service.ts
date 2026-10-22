import type { D1Database } from "@cloudflare/workers-types";
import {
  createSession,
  generateSessionToken,
} from "../../lib/session";

export type CreatedSession = {
  token: string;
  expiresAt: string;
};

export async function createUserSession(
  db: D1Database,
  userId: string,
): Promise<CreatedSession> {
  const token = generateSessionToken();
  const session = await createSession(db, userId, token);

  return {
    token,
    expiresAt: session.expiresAt,
  };
}