CREATE TABLE "md_doc_revisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"doc_id" integer NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"saved_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "md_doc_revisions" ADD CONSTRAINT "md_doc_revisions_doc_id_md_docs_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."md_docs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "md_doc_revisions" ADD CONSTRAINT "md_doc_revisions_saved_by_users_id_fk" FOREIGN KEY ("saved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;