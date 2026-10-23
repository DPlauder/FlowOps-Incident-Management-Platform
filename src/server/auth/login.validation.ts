import type { LoginInput } from "./login.types";

const MAX_EMAIL_LENGTH = 255;
const MAX_PASSWORD_LENGTH = 255;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); 
}

export function validateLoginInput(value: unknown): LoginInput {
    if(!isRecord(value)) {
        throw new Error("Ungültige Anfrage");
    }

    const { email, password } = value;

    if(
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password.trim() 
    ) {
        throw new Error("Email und Passwort sind erforderlich");
    }

    const normalizedEmail = email.trim().toLowerCase();

    if(
        normalizedEmail.length === 0 ||
        normalizedEmail.length > MAX_EMAIL_LENGTH ||
        !isValidEmail(normalizedEmail)

    ) {
        throw new Error("Ungültige Email");
    }

    if(password.length > MAX_PASSWORD_LENGTH) {
        throw new Error("Passwort ist zu lang");
    }
    
    return {
        email: normalizedEmail,
        password
    };
}