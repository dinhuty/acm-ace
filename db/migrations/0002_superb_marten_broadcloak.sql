CREATE TABLE "sql_snippets" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer,
	CONSTRAINT "sql_snippets_category_title_unique" UNIQUE("category","title")
);
--> statement-breakpoint
ALTER TABLE "sql_snippets" ADD CONSTRAINT "sql_snippets_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;