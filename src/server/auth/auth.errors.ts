// src/server/auth/auth.errors.ts

/**
 * Basisklasse für alle fachlichen Authentifizierungsfehler.
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Wird geworfen, wenn die Anmeldedaten (E-Mail oder Passwort) falsch sind,
 * der Benutzer nicht existiert oder das Benutzerkonto inaktiv ist.
 * Verhindert Account Enumeration durch einheitliche Behandlung.
 */
export class InvalidCredentialsError extends AuthError {
  constructor() {
    super("Ungültige Anmeldedaten.");
    this.name = "InvalidCredentialsError";
  }
}

/**
 * Wird geworfen, wenn bei der Registrierung ein Konflikt auftritt
 * (z. B. E-Mail-Adresse bereits vergeben).
 */
export class RegistrationConflictError extends AuthError {
  constructor() {
    super("Registrierungskonflikt.");
    this.name = "RegistrationConflictError";
  }
}

/**
 * Prüft, ob ein aufgetretener Datenbank-Fehler ein SQLite Unique-Constraint-Verstoß
 * auf der Spalte users.email ist.
 */
export function isEmailUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Error &&
    /unique constraint failed: users\.email/i.test(error.message)
  );
}