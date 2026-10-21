import type { D1Database } from "@cloudflare/workers-types";

export const SESSION_COOKIE_NAME = "session";
const SESSION_EXPIRATION_DAYS = 30;

// Wandelt ein ArrayBuffer in einen Hex-String um
function bufferToHex(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// 1. Zufälliges Token für den Client (32 Bytes, Base64url)
export function generateSessionToken(): string{
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}

// 2. SHA-256 Hash des Tokens zur Speicherung als sessions.id in D1
export async function hashSessionToken(token: string): Promise<string> {
    const enc = new TextEncoder();
    const digest = await crypto.subtle.digest("SHA-256", enc.encode(token));
    return bufferToHex(digest);
}

// 3. Neue Session in D1 anlegen
export async function createSession(
    db: D1Database,
    userId: string,
    token: string
): Promise<{ id: string; expiresAt: string }> {
    const sessionId = await hashSessionToken(token);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_EXPIRATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const createdAt = now.toISOString();
    const lastUsedAt = createdAt;

    await db
        .prepare(
            "INSERT INTO sessions (id, user_id, expires_at, created_at, last_used_at) VALUES (?, ?, ?, ?, ?)"
        )
        .bind(sessionId, userId, expiresAt, createdAt, lastUsedAt)
        .run();

    return { id: sessionId, expiresAt };
}
