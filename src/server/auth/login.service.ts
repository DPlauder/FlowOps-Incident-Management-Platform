import type {D1Database} from "@cloudflare/workers-types";
import {verifyPassword} from "../../lib/password";
import { createUserSession } from "./session.service";
import type { AuthenticatedUser, LoginInput } from "./login.types";
import type { UserEntity } from "../users/user.types";
import { InvalidCredentialsError } from "./auth.errors";


export async function loginUser(
    db: D1Database,
    input: LoginInput
): Promise<AuthenticatedUser> {
    const user = await db.prepare(
        "SELECT id, email, password_hash, display_name, is_active, created_at, updated_at FROM users WHERE email = ?",
    )
    .bind(input.email)
    .first<UserEntity>();

    if(!user || user.is_active !== 1){
        throw new InvalidCredentialsError();
    }
    
    const isPasswordValid = await verifyPassword(
        input.password,
        user.password_hash
    );
    if(!isPasswordValid){
        throw new InvalidCredentialsError();
    }
    const session = await createUserSession(db, user.id);

    return{
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        sessionToken: session.token
    }
}