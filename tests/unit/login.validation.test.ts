import { describe, expect, it } from "vitest";
import { validateLoginInput } from "../../src/server/auth/login.validation";

describe("validateLoginInput", () => {
  it("akzeptiert gültige Zugangsdaten und normalisiert die E-Mail", () => {
    const input = {
      email: "  Max.Mustermann@Example.COM  ",
      password: "SuperSicheresPasswort123!",
    };

    const result = validateLoginInput(input);

    expect(result.email).toBe("max.mustermann@example.com");
    expect(result.password).toBe("SuperSicheresPasswort123!");
  });

  it("wirft einen Fehler, wenn der Wert kein Objekt ist", () => {
    expect(() => validateLoginInput(null)).toThrow("Ungültige Anfrage");
    expect(() => validateLoginInput("string")).toThrow("Ungültige Anfrage");
    expect(() => validateLoginInput(123)).toThrow("Ungültige Anfrage");
    expect(() => validateLoginInput([])).toThrow("Ungültige Anfrage");
  });

  it("wirft einen Fehler bei fehlender E-Mail oder fehlendem Passwort", () => {
    expect(() => validateLoginInput({ password: "pass" })).toThrow(
      "Email und Passwort sind erforderlich"
    );
    expect(() => validateLoginInput({ email: "test@example.com" })).toThrow(
      "Email und Passwort sind erforderlich"
    );
    expect(() =>
      validateLoginInput({ email: "   ", password: "pass" })
    ).toThrow("Email und Passwort sind erforderlich");
    expect(() =>
      validateLoginInput({ email: "test@example.com", password: "" })
    ).toThrow("Email und Passwort sind erforderlich");
  });

  it("wirft einen Fehler bei ungültigem E-Mail-Format", () => {
    expect(() =>
      validateLoginInput({ email: "keine-email", password: "pass" })
    ).toThrow("Ungültige Email");
    expect(() =>
      validateLoginInput({ email: "test@", password: "pass" })
    ).toThrow("Ungültige Email");
    expect(() =>
      validateLoginInput({ email: "@example.com", password: "pass" })
    ).toThrow("Ungültige Email");
  });

  it("wirft einen Fehler bei überlangem Passwort (> 255 Zeichen)", () => {
    const longPassword = "a".repeat(256);
    expect(() =>
      validateLoginInput({
        email: "test@example.com",
        password: longPassword,
      })
    ).toThrow("Passwort ist zu lang");
  });
});