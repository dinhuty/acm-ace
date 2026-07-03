CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"slack_task_url" text DEFAULT '' NOT NULL,
	"slack_review_url" text DEFAULT '' NOT NULL,
	"procedure_id" integer,
	"doc_url" text DEFAULT '' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_procedure_id_release_procedures_id_fk" FOREIGN KEY ("procedure_id") REFERENCES "public"."release_procedures"("id") ON DELETE set null ON UPDATE no action;