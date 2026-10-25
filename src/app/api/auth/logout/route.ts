import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "../../../../lib/session";
import { revokeUserSession } from "../../../../server/auth/session.service";
import { clearSessionCookie } from "../../../../server/auth/session.cookie";

function readSessionToken(request: Request): string | null {
    const cookieHeader = request.headers.get("cookie");
    if( !cookieHeader ) return null;
    const cookiePrefix = `${SESSION_COOKIE_NAME}=`;
    const sessionCookie = cookieHeader.split(";").map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith(cookiePrefix));
    return sessionCookie ? sessionCookie.slice(cookiePrefix.length) : null;
}

export async function POST(request: Request): Promise<NextResponse> {
    const token = readSessionToken(request);
    try {
        if(token){
            await revokeUserSession(env.flowops_db, token);
        }
        const response = NextResponse.json(
            { message: "Erfolgreich abgemeldet" },
            { status: 200 }
        );
        clearSessionCookie(response);
        return response;
    } catch (error) {
        console.error("Logout error:", error);
        const response = NextResponse.json(
            { error: "Interner Serverfehler aufgetreten." },
            { status: 500 }
        );
        clearSessionCookie(response);
        return response;
    }
}