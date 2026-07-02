import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { releaseTemplates } from "@/db/schema";
import { ProcedureBuilder } from "@/components/organisms/release-procedure/ProcedureBuilder";
import { requireUser } from "@/lib/auth/dal";

export default async function NewProcedurePage() {
  await requireUser();
  const templates = await db
    .select({
      id: releaseTemplates.id,
      category: releaseTemplates.category,
      name: releaseTemplates.name,
      repo: releaseTemplates.repo,
      bodyJa: releaseTemplates.bodyJa,
      bodyEn: releaseTemplates.bodyEn,
      bodyVi: releaseTemplates.bodyVi,
    })
    .from(releaseTemplates)
    .orderBy(asc(releaseTemplates.category), asc(releaseTemplates.name));

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xxs">
        <Link
          href="/release-procedure"
          className="text-caption text-stone hover:underline"
        >
          ← Release Procedure
        </Link>
        <h1 className="text-heading-2 text-ink">New procedure</h1>
      </div>
      <ProcedureBuilder templates={templates} />
    </div>
  );
}
