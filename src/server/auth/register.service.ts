import type { D1Database } from "@cloudflare/workers-types";
import { hashPassword } from "../../lib/password";
import { createUserSession } from "../../server/auth/session.service";
import type { RegisterInput, RegisteredUser } from "./register.types";
import { RegistrationConflictError } from "./auth.errors";
import { isEmailUniqueConstraintError } from "./auth.errors";

export async function registerUser(
  db: D1Database,
  input: RegisterInput,
): Promise<RegisteredUser> {
  const existingUser = await db
    .prepare("SELECT id FROM users WHERE email = ?")
    .bind(input.email)
    .first<{ id: string }>();

  if (existingUser) {
    throw new RegistrationConflictError();
  }

  const passwordHash = await hashPassword(input.password);
  const userId = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await db
      .prepare(
        `INSERT INTO users (
          id,
          email,
          password_hash,
          display_name,
          is_active,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        userId,
        input.email,
        passwordHash,
        input.displayName,
        1,
        now,
        now,
      )
      .run();
  } catch (error) {
    if (isEmailUniqueConstraintError(error)) {
      throw new RegistrationConflictError();
    }

    throw error;
  }

  const session = await createUserSession(db, userId);

  return {
    id: userId,
    email: input.email,
    displayName: input.displayName,
    sessionToken: session.token,
  };
}