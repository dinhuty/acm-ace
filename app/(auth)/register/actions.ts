"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import type { AuthState } from "@/app/(auth)/login/actions";

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (username.length < 3) {
    return { error: "Username must be at least 3 characters." };
  }
  if (password.length < 4) {
    return { error: "Password must be at least 4 characters." };
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  if (existing[0]) {
    return { error: "Username is already taken." };
  }

  const passwordHash = await hashPassword(password);
  const inserted = await db
    .insert(users)
    .values({ username, passwordHash })
    .returning({ id: users.id });

  await createSession(inserted[0].id);
  redirect("/");
}
