"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { mdDocs } from "@/db/schema";
import { requireUser } from "@/lib/auth/dal";

export type MdDocInput = {
  title: string;
  body: string;
  tags: string[];
};

export type MdDocResult = { ok: true; id?: number } | { ok: false; error: string };

function normalize(i: MdDocInput): MdDocInput {
  return {
    title: i.title.trim(),
    body: i.body,
    tags: [...new Set(i.tags.map((t) => t.trim().toLowerCase()).filter(Boolean))],
  };
}

export async function createMdDoc(input: MdDocInput): Promise<MdDocResult> {
  const user = await requireUser();
  const d = normalize(input);
  if (!d.title) return { ok: false, error: "Tiêu đề là bắt buộc." };
  const rows = await db
    .insert(mdDocs)
    .values({ ...d, updatedBy: user.id })
    .returning({ id: mdDocs.id });
  revalidatePath("/md-docs");
  return { ok: true, id: rows[0].id };
}

export async function updateMdDoc(
  id: number,
  input: MdDocInput,
): Promise<MdDocResult> {
  const user = await requireUser();
  const d = normalize(input);
  if (!d.title) return { ok: false, error: "Tiêu đề là bắt buộc." };
  await db
    .update(mdDocs)
    .set({ ...d, updatedBy: user.id, updatedAt: new Date() })
    .where(eq(mdDocs.id, id));
  revalidatePath("/md-docs");
  return { ok: true };
}

export async function deleteMdDoc(id: number): Promise<MdDocResult> {
  await requireUser();
  await db.delete(mdDocs).where(eq(mdDocs.id, id));
  revalidatePath("/md-docs");
  return { ok: true };
}
