import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { releaseProcedures } from "@/db/schema";
import { LANGUAGES } from "@/lib/release-procedure/markdown";
import { requireUser } from "@/lib/auth/dal";
import { Button } from "@/components/atoms/Button";

export default async function ReleaseProcedureHome() {
  await requireUser();
  const procedures = await db
    .select({
      id: releaseProcedures.id,
      title: releaseProcedures.title,
      language: releaseProcedures.language,
      updatedAt: releaseProcedures.updatedAt,
    })
    .from(releaseProcedures)
    .orderBy(desc(releaseProcedures.updatedAt));

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-wrap items-center justify-between gap-sm">
        <div className="flex flex-col gap-xxs">
          <Link href="/" className="text-caption text-stone hover:underline">
            ← Tools
          </Link>
          <h1 className="text-heading-2 text-ink">Release Procedure</h1>
        </div>
        <div className="flex gap-xs">
          <Link href="/release-procedure/templates">
            <Button variant="secondary" type="button">
              Manage templates
            </Button>
          </Link>
          <Link href="/release-procedure/new">
            <Button type="button">+ New procedure</Button>
          </Link>
        </div>
      </div>

      {procedures.length === 0 ? (
        <p className="text-body-sm text-stone">
          No saved procedures yet. Create one from your templates.
        </p>
      ) : (
        <div className="flex flex-col gap-xs">
          {procedures.map((p) => (
            <Link
              key={p.id}
              href={`/release-procedure/${p.id}`}
              className="flex items-center justify-between gap-sm rounded-lg border border-hairline bg-canvas p-md transition-colors hover:border-brand-green"
            >
              <span className="text-body-md-medium text-ink">{p.title}</span>
              <span className="flex items-center gap-sm text-caption text-stone">
                <span>
                  {LANGUAGES.find((l) => l.value === p.language)?.label ??
                    p.language}
                </span>
                <span>{p.updatedAt.toLocaleDateString()}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
