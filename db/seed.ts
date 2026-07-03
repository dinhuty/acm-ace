import { db } from "../lib/db";
import { releaseTemplates, sqlSnippets } from "./schema";
import { releaseTemplateSeeds } from "./release-templates.data";
import { sqlSnippetSeeds } from "./sql-snippets.data";

// Idempotent seed: unique keys mean re-running only inserts what's missing, so
// it's safe to run on every deploy (see the compose `migrate` service).
async function seed() {
  const templates = await db
    .insert(releaseTemplates)
    .values(releaseTemplateSeeds)
    .onConflictDoNothing({ target: releaseTemplates.name })
    .returning({ id: releaseTemplates.id });

  const snippets = await db
    .insert(sqlSnippets)
    .values(sqlSnippetSeeds)
    .onConflictDoNothing({
      target: [sqlSnippets.category, sqlSnippets.title],
    })
    .returning({ id: sqlSnippets.id });

  console.log(
    `Seed complete. Release templates: +${templates.length}, SQL snippets: +${snippets.length}.`,
  );
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
