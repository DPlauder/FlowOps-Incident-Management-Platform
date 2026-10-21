import { describe, expect, it } from "vitest";
import { validatePassword, hashPassword, verifyPassword } from "../../src/lib/password";

describe("validatePassword", () => {
    it("gibt '' zurück, wenn das Password mindestens 12 Zeichen lang ist", () => {
        expect(validatePassword("einlangespasswort")).toBe("");
    });
    it("gibt '' zurück, wenn das Password genau 12 Zeichen lang ist", () => {
        expect(validatePassword("zwölfzeichen")).toBe("");
    });
    it("gibt eine Fehlermeldung zurück, wenn das Password 11 Zeichen lang ist", () => {
        expect(validatePassword("abcdefghijk")).toBe(" Das Password muss mindestens 12 Zeichen lang sein");
    });
    it("gibt eine Fehlermeldung zurück, wenn String leer ist", () => {
        expect(validatePassword("")).toBe(" Das Password muss mindestens 12 Zeichen lang sein");
    });
});

describe("hashPassword und verifyPassword", () => {
    it("gibt einen String im korrekten Format zurück", async () => {
        const hash = await hashPassword("sicherespasswort123");
        const parts = hash.split(':');
        expect(parts).toHaveLength(5);
        expect(parts[0]).toBe("pbkdf2");
        expect(parts[1]).toBe("sha256");
        expect(parts[2]).toBe("600000");
    }, 10000);
    it("erzeugt bei gleichen Passwörtern unterschiedliche Hashes", async () => {
    const password = "sicherespasswort123";
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    expect(hash1).not.toBe(hash2);
  }, 15_000);
});

describe("verifyPassword", () => {
  it("gibt true zurück für das korrekte Passwort", async () => {
    const hash = await hashPassword("sicherespasswort123");
    expect(await verifyPassword("sicherespasswort123", hash)).toBe(true);
  }, 15_000);
  it("gibt false zurück für ein falsches Passwort", async () => {
    const hash = await hashPassword("sicherespasswort123");
    expect(await verifyPassword("falschespasswort123", hash)).toBe(false);
  }, 15_000);
  it("gibt false zurück für einen ungültigen gespeicherten String", async () => {
    expect(await verifyPassword("sicherespasswort123", "kein:gueltiges:format")).toBe(false);
  });
  it("gibt false zurück für einen leeren gespeicherten String", async () => {
    expect(await verifyPassword("sicherespasswort123", "")).toBe(false);
  });
});