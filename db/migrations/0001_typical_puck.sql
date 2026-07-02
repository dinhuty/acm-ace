ALTER TABLE "release_procedures" ADD COLUMN "variables" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "release_templates" ADD COLUMN "repo" text DEFAULT '' NOT NULL;