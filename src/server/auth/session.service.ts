import type { D1Database } from "@cloudflare/workers-types";
import {
  createSession,
  generateSessionToken,
  hashSessionToken,
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

export async function revokeUserSession(
  db: D1Database,
  token: string,
): Promise<void> {
  const sessionId = await hashSessionToken(token);
  await db
    .prepare("DELETE FROM sessions WHERE id = ?")
    .bind(sessionId)
    .run();
}