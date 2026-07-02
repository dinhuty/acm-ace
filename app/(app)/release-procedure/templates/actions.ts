"use server";

import { revalidatePath } from "next/cache";
import { eq, and, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { releaseTemplates } from "@/db/schema";
import { requireUser } from "@/lib/auth/dal";

export type TemplateInput = {
  category: string;
  name: string;
  repo: string;
  bodyJa: string;
  bodyEn: string;
  bodyVi: string;
};

export type TemplateResult = { ok: true } | { ok: false; error: string };

function normalize(input: TemplateInput): TemplateInput {
  return {
    category: input.category.trim(),
    name: input.name.trim(),
    repo: input.repo.trim(),
    bodyJa: input.bodyJa,
    bodyEn: input.bodyEn,
    bodyVi: input.bodyVi,
  };
}

export async function createTemplate(
  input: TemplateInput,
): Promise<TemplateResult> {
  const user = await requireUser();
  const data = normalize(input);
  if (!data.name) return { ok: false, error: "Name is required." };

  const clash = await db
    .select({ id: releaseTemplates.id })
    .from(releaseTemplates)
    .where(eq(releaseTemplates.name, data.name))
    .limit(1);
  if (clash[0]) return { ok: false, error: "A template with this name already exists." };

  await db.insert(releaseTemplates).values({ ...data, updatedBy: user.id });
  revalidatePath("/release-procedure/templates");
  revalidatePath("/release-procedure/new");
  return { ok: true };
}

export async function updateTemplate(
  id: number,
  input: TemplateInput,
): Promise<TemplateResult> {
  const user = await requireUser();
  const data = normalize(input);
  if (!data.name) return { ok: false, error: "Name is required." };

  const clash = await db
    .select({ id: releaseTemplates.id })
    .from(releaseTemplates)
    .where(and(eq(releaseTemplates.name, data.name), ne(releaseTemplates.id, id)))
    .limit(1);
  if (clash[0]) return { ok: false, error: "A template with this name already exists." };

  await db
    .update(releaseTemplates)
    .set({ ...data, updatedBy: user.id, updatedAt: new Date() })
    .where(eq(releaseTemplates.id, id));
  revalidatePath("/release-procedure/templates");
  revalidatePath("/release-procedure/new");
  return { ok: true };
}

export async function deleteTemplate(id: number): Promise<TemplateResult> {
  await requireUser();
  await db.delete(releaseTemplates).where(eq(releaseTemplates.id, id));
  revalidatePath("/release-procedure/templates");
  revalidatePath("/release-procedure/new");
  return { ok: true };
}
