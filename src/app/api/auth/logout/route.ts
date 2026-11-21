import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { revokeUserSession } from "../../../../server/auth/session.service";
import { clearSessionCookie, readSessionToken } from "../../../../server/auth/session.cookie";


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