"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { mdDocs, mdTags, mdDocRevisions } from "@/db/schema";
import { requireUser } from "@/lib/auth/dal";

export type MdDocInput = {
  title: string;
  body: string;
  tags: string[];
};

export type MdDocResult =
  | { ok: true; id?: number }
  | { ok: false; error: string; conflict?: boolean };

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
  opts?: { baseUpdatedAt?: number; force?: boolean },
): Promise<MdDocResult> {
  const user = await requireUser();
  const d = normalize(input);
  if (!d.title) return { ok: false, error: "Tiêu đề là bắt buộc." };

  const [cur] = await db
    .select({
      title: mdDocs.title,
      body: mdDocs.body,
      tags: mdDocs.tags,
      updatedBy: mdDocs.updatedBy,
      updatedAt: mdDocs.updatedAt,
    })
    .from(mdDocs)
    .where(eq(mdDocs.id, id))
    .limit(1);
  if (!cur) return { ok: false, error: "Không tìm thấy doc." };

  // Conflict guard: someone else may have saved since this editor loaded.
  if (opts?.baseUpdatedAt && !opts.force && cur.updatedAt.getTime() > opts.baseUpdatedAt) {
    return {
      ok: false,
      conflict: true,
      error: "Người khác vừa sửa doc này. Tải lại để xem, hoặc bấm Ghi đè.",
    };
  }

  // Snapshot the prior version (only when content actually changes).
  if (cur.title !== d.title || cur.body !== d.body) {
    await db.insert(mdDocRevisions).values({
      docId: id,
      title: cur.title,
      body: cur.body,
      tags: cur.tags,
      savedBy: cur.updatedBy ?? null,
    });
  }

  await db
    .update(mdDocs)
    .set({ ...d, updatedBy: user.id, updatedAt: new Date() })
    .where(eq(mdDocs.id, id));
  revalidatePath("/md-docs");
  revalidatePath(`/md-docs/${id}`);
  return { ok: true, id };
}

export async function restoreMdDocRevision(
  docId: number,
  revisionId: number,
): Promise<MdDocResult> {
  await requireUser();
  const [rev] = await db
    .select()
    .from(mdDocRevisions)
    .where(and(eq(mdDocRevisions.id, revisionId), eq(mdDocRevisions.docId, docId)))
    .limit(1);
  if (!rev) return { ok: false, error: "Không tìm thấy phiên bản." };
  return updateMdDoc(
    docId,
    { title: rev.title, body: rev.body, tags: rev.tags },
    { force: true },
  );
}

export async function deleteMdDoc(id: number): Promise<MdDocResult> {
  await requireUser();
  await db.delete(mdDocs).where(eq(mdDocs.id, id));
  revalidatePath("/md-docs");
  return { ok: true };
}

// ---------- Tag config (name + color) ----------

export async function createMdTag(
  name: string,
  color: string,
): Promise<MdDocResult> {
  await requireUser();
  const n = name.trim().toLowerCase();
  if (!n) return { ok: false, error: "Tên tag là bắt buộc." };
  const clash = await db
    .select({ id: mdTags.id })
    .from(mdTags)
    .where(eq(mdTags.name, n))
    .limit(1);
  if (clash[0]) return { ok: false, error: "Tag đã tồn tại." };
  await db.insert(mdTags).values({ name: n, color: color.trim() || "#888888" });
  revalidatePath("/md-docs");
  return { ok: true };
}

export async function updateMdTag(
  id: number,
  name: string,
  color: string,
): Promise<MdDocResult> {
  await requireUser();
  const n = name.trim().toLowerCase();
  if (!n) return { ok: false, error: "Tên tag là bắt buộc." };
  const clash = await db
    .select({ id: mdTags.id })
    .from(mdTags)
    .where(and(eq(mdTags.name, n), ne(mdTags.id, id)))
    .limit(1);
  if (clash[0]) return { ok: false, error: "Tag đã tồn tại." };
  await db
    .update(mdTags)
    .set({ name: n, color: color.trim() || "#888888" })
    .where(eq(mdTags.id, id));
  revalidatePath("/md-docs");
  return { ok: true };
}

export async function deleteMdTag(id: number): Promise<MdDocResult> {
  await requireUser();
  await db.delete(mdTags).where(eq(mdTags.id, id));
  revalidatePath("/md-docs");
  return { ok: true };
}
