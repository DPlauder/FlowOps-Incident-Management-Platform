import { describe, expect, it, vi } from "vitest";
import {
  generateSessionToken,
  hashSessionToken,
  createSession,
  SESSION_COOKIE_NAME,
} from "../../src/lib/session";
import type { D1Database } from "@cloudflare/workers-types";

describe("SESSION_COOKIE_NAME", () => {
  it("ist als 'session' definiert", () => {
    expect(SESSION_COOKIE_NAME).toBe("session");
  });
});

describe("generateSessionToken", () => {
  it("erzeugt einen Base64url-kompatiblen String", () => {
    const token = generateSessionToken();
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
    // Base64url darf kein +, / oder = enthalten
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("erzeugt bei jedem Aufruf ein eindeutiges Token", () => {
    const token1 = generateSessionToken();
    const token2 = generateSessionToken();
    expect(token1).not.toBe(token2);
  });
});

describe("hashSessionToken", () => {
  it("erzeugt einen 64-Zeichen langen Hex-String (SHA-256)", async () => {
    const token = generateSessionToken();
    const hash = await hashSessionToken(token);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("ist deterministisch für das gleiche Token", async () => {
    const token = "festes-test-token-123";
    const hash1 = await hashSessionToken(token);
    const hash2 = await hashSessionToken(token);
    expect(hash1).toBe(hash2);
  });

  it("erzeugt unterschiedliche Hashes für unterschiedliche Tokens", async () => {
    const hash1 = await hashSessionToken("token-a");
    const hash2 = await hashSessionToken("token-b");
    expect(hash1).not.toBe(hash2);
  });
});

describe("createSession", () => {
  it("speichert den Hash und korrekte Ablaufdaten in der Datenbank", async () => {
    const mockRun = vi.fn().mockResolvedValue({ success: true });
    const mockBind = vi.fn().mockReturnValue({ run: mockRun });
    const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });

    const mockDb = {
      prepare: mockPrepare,
    } as unknown as D1Database;

    const token = "geheimes-client-token";
    const expectedHash = await hashSessionToken(token);
    const userId = "user-123";

    const result = await createSession(mockDb, userId, token);

    // 1. Ergebnis enthält die Session-ID (Hash)
    expect(result.id).toBe(expectedHash);

    // 2. SQL-Statement geprüft
    expect(mockPrepare).toHaveBeenCalledWith(
      "INSERT INTO sessions (id, user_id, expires_at, created_at, last_used_at) VALUES (?, ?, ?, ?, ?)"
    );

    // 3. Parameter geprüft: sessionId (Hash), userId, expiresAt, createdAt, lastUsedAt
    const bindArgs = mockBind.mock.calls[0];
    expect(bindArgs[0]).toBe(expectedHash); // id ist der Hash!
    expect(bindArgs[1]).toBe(userId);
    
    // Ablaufdatum prüfen: ca. 30 Tage in der Zukunft
    const expiresAt = new Date(bindArgs[2]).getTime();
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    expect(expiresAt).toBeGreaterThanOrEqual(now + thirtyDaysMs - 5000);
    expect(expiresAt).toBeLessThanOrEqual(now + thirtyDaysMs + 5000);

    expect(mockRun).toHaveBeenCalled();
  });
});