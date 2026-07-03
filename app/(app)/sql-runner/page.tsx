import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { sqlSnippets } from "@/db/schema";
import { requireUser } from "@/lib/auth/dal";
import { SnippetLibrary } from "@/components/organisms/sql-runner/SnippetLibrary";

export default async function SqlRunnerPage() {
  await requireUser();

  const snippets = await db
    .select({
      id: sqlSnippets.id,
      category: sqlSnippets.category,
      title: sqlSnippets.title,
      body: sqlSnippets.body,
    })
    .from(sqlSnippets)
    .orderBy(asc(sqlSnippets.category), asc(sqlSnippets.title));

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xxs">
        <Link href="/" className="text-caption text-stone hover:underline">
          ← Tools
        </Link>
        <h1 className="text-heading-2 text-ink">SQL Runner</h1>
        <p className="text-body-sm text-steel">
          Thư viện SQL snippet — copy về máy tự chạy (không exec trên server).
          Master data, mọi user thêm / sửa / xoá được.
        </p>
      </div>
      <SnippetLibrary snippets={snippets} />
    </div>
  );
}
