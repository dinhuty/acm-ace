import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { mdDocs, mdDocRevisions, users } from "@/db/schema";
import { requireUser } from "@/lib/auth/dal";
import { MdDocHistory } from "@/components/organisms/md-docs/MdDocHistory";

export default async function MdDocHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const docId = Number(id);
  if (!Number.isInteger(docId)) notFound();

  const [doc] = await db
    .select({ id: mdDocs.id, title: mdDocs.title, body: mdDocs.body })
    .from(mdDocs)
    .where(eq(mdDocs.id, docId))
    .limit(1);
  if (!doc) notFound();

  const revisions = await db
    .select({
      id: mdDocRevisions.id,
      body: mdDocRevisions.body,
      savedByName: users.username,
      createdAt: mdDocRevisions.createdAt,
    })
    .from(mdDocRevisions)
    .leftJoin(users, eq(mdDocRevisions.savedBy, users.id))
    .where(eq(mdDocRevisions.docId, docId))
    .orderBy(desc(mdDocRevisions.createdAt));

  return (
    <div className="flex flex-col gap-md">
      <Link
        href={`/md-docs/${doc.id}`}
        className="text-caption text-stone hover:underline"
      >
        ← {doc.title}
      </Link>
      <h1 className="text-heading-3 text-ink">Lịch sử — {doc.title}</h1>
      <MdDocHistory docId={doc.id} currentBody={doc.body} revisions={revisions} />
    </div>
  );
}
