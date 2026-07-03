"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { sqlSnippets } from "@/db/schema";
import { requireUser } from "@/lib/auth/dal";

export type SnippetInput = { category: string; title: string; body: string };
export type SnippetResult = { ok: true } | { ok: false; error: string };

function normalize(i: SnippetInput): SnippetInput {
  return { category: i.category.trim(), title: i.title.trim(), body: i.body };
}

async function titleClash(
  category: string,
  title: string,
  exceptId?: number,
): Promise<boolean> {
  const rows = await db
    .select({ id: sqlSnippets.id })
    .from(sqlSnippets)
    .where(
      exceptId
        ? and(
            eq(sqlSnippets.category, category),
            eq(sqlSnippets.title, title),
            ne(sqlSnippets.id, exceptId),
          )
        : and(eq(sqlSnippets.category, category), eq(sqlSnippets.title, title)),
    )
    .limit(1);
  return Boolean(rows[0]);
}

export async function createSnippet(input: SnippetInput): Promise<SnippetResult> {
  const user = await requireUser();
  const d = normalize(input);
  if (!d.title) return { ok: false, error: "Title is required." };
  if (!d.body.trim()) return { ok: false, error: "SQL body is required." };
  if (await titleClash(d.category, d.title)) {
    return { ok: false, error: "A snippet with this category + title exists." };
  }
  await db.insert(sqlSnippets).values({ ...d, updatedBy: user.id });
  revalidatePath("/sql-runner");
  return { ok: true };
}

export async function updateSnippet(
  id: number,
  input: SnippetInput,
): Promise<SnippetResult> {
  const user = await requireUser();
  const d = normalize(input);
  if (!d.title) return { ok: false, error: "Title is required." };
  if (!d.body.trim()) return { ok: false, error: "SQL body is required." };
  if (await titleClash(d.category, d.title, id)) {
    return { ok: false, error: "A snippet with this category + title exists." };
  }
  await db
    .update(sqlSnippets)
    .set({ ...d, updatedBy: user.id, updatedAt: new Date() })
    .where(eq(sqlSnippets.id, id));
  revalidatePath("/sql-runner");
  return { ok: true };
}

export async function deleteSnippet(id: number): Promise<SnippetResult> {
  await requireUser();
  await db.delete(sqlSnippets).where(eq(sqlSnippets.id, id));
  revalidatePath("/sql-runner");
  return { ok: true };
}
