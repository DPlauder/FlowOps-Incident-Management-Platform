import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { hashPassword, validatePassword } from "../../../../lib/password";
import { createSession, generateSessionToken, SESSION_COOKIE_NAME } from "../../../../lib/session";
// Hilfsfunktion zur einfachen Validierung des E-Mail-Formats
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        if(!body || typeof body !== "object") {
            return NextResponse.json(
                { error: "Ungültige Anfrage" },
                { status: 400 }
            );
        }
        const { email, password, displayName } = body as Record<string, unknown>;
        if(
            typeof email !== "string" ||
            typeof password !== "string" ||
            typeof displayName !== "string" ||
            !displayName.trim()
        ) {
            return NextResponse.json(
                { error: "Name, E-Mail und Passwort sind erforderlich." },
                { status: 400 }
            );
        }
        
        const normalizedEmail = email.toLowerCase().trim();
        if(!isValidEmail(normalizedEmail)) {
            return NextResponse.json(
                { error: "Ungültige E-Mail-Adresse" },
                { status: 400 }
            );
        }

        const passwordError = validatePassword(password);
        if(passwordError) {
            return NextResponse.json(
                { error: passwordError },
                { status: 400 }
            );
        }

        const db = env.flowops_db;
        
        const existingUser = await db.prepare("SELECT id FROM users WHERE email = ?").bind(normalizedEmail).first<{ id: string }>();
        if(existingUser) {
            return NextResponse.json(
                { error: "Registrierung konnte nicht durchgeführt werden." },
                { status: 400 }
            );
        }

        const passwordHash = await hashPassword(password);

        const userId = crypto.randomUUID();
        const now = new Date().toISOString();
        const trimmedDisplayName = displayName.trim();

        await db.prepare("INSERT INTO users (id, email, password_hash, display_name, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(
            userId,
            normalizedEmail,
            passwordHash,
            trimmedDisplayName,
            1,
            now,
            now
        ).run();

        const sessionToken = generateSessionToken();
        await createSession(db, userId, sessionToken);

        const response = NextResponse.json(
            { 
                id: userId,
                email: normalizedEmail,
                displayName: trimmedDisplayName 
            },
            {status: 201}
        );
        const isProduction = process.env.NODE_ENV === "production";
        const maxAgeSeconds = 30 * 24 * 60 * 60; // 30 Tage

        response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            maxAge: maxAgeSeconds,
            path: "/"
        });
        return response;
    } catch (error){
        console.error("Registrierung fehlgeschlagen:", error);
        return NextResponse.json(
            { error: "Interner Serverfehler aufgetreten." },
            { status: 500 }
        );
    }
}