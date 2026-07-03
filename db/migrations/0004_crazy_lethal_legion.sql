ALTER TABLE "tasks" ADD COLUMN "description" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "prs" jsonb DEFAULT '[]'::jsonb NOT NULL;