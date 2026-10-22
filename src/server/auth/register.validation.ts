import {validatePassword} from "../../lib/password";
import { RegisterInput } from "./register.types";

const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 256;
const MAX_DISPLAY_NAME_LENGTH = 150;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateRegisterInput(value: unknown): RegisterInput {
  if (!isRecord(value)) {
    throw new Error("Ungültige Anfrage");
  }

  const { email, password, displayName } = value;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof displayName !== "string" ||
    !displayName.trim()
  ) {
    throw new Error("Name, E-Mail und Passwort sind erforderlich.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedDisplayName = displayName.trim();

  if (
    normalizedEmail.length === 0 ||
    normalizedEmail.length > MAX_EMAIL_LENGTH ||
    !isValidEmail(normalizedEmail)
  ) {
    throw new Error("Ungültige E-Mail-Adresse");
  }

  if (normalizedDisplayName.length > MAX_DISPLAY_NAME_LENGTH) {
    throw new Error("Der Name ist zu lang.");
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    throw new Error("Das Passwort ist zu lang.");
  }

  const passwordError = validatePassword(password);

  if (passwordError) {
    throw new Error(passwordError.trim());
  }

  return {
    email: normalizedEmail,
    password,
    displayName: normalizedDisplayName,
  };
}