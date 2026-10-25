import type { D1Database } from "@cloudflare/workers-types";
import {
  createSession,
  generateSessionToken,
  hashSessionToken,
} from "../../lib/session";
import type { SafeUser } from "../users/user.types";



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

export async function getSafeUser(
  db: D1Database,
  token: string | null,
): Promise<SafeUser | null> {
  if (!token) {
    return null;
  }

  const sessionId = await hashSessionToken(token);

  return db
    .prepare(
      `SELECT users.id, users.email, users.display_name AS displayName
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.id = ?
         AND sessions.expires_at > ?
         AND users.is_active = 1`,
    )
    .bind(sessionId, new Date().toISOString())
    .first<SafeUser>();
}
