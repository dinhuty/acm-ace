import {
  pgTable,
  serial,
  text,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Opaque random token in `id`; the token itself is the session secret, so no
// separate cookie encryption is needed.
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Shared master data: a reusable trilingual release block (e.g. "Merge PR to
// master", "Release air-closet-api"). `body_*` holds copy-paste markdown with
// `${...}` placeholders. `repo` scopes per-repo placeholders (${repo}/${pr}/…).
export const releaseTemplates = pgTable("release_templates", {
  id: serial("id").primaryKey(),
  category: text("category").notNull().default(""),
  name: text("name").notNull().unique(),
  repo: text("repo").notNull().default(""),
  bodyJa: text("body_ja").notNull().default(""),
  bodyEn: text("body_en").notNull().default(""),
  bodyVi: text("body_vi").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedBy: integer("updated_by").references(() => users.id, {
    onDelete: "set null",
  }),
});

export type ProcedureLanguage = "ja" | "en" | "vi";

// One ordered block of a saved procedure — a snapshot of the chosen-language
// template body (placeholders kept), editable inline. `repo` binds per-repo
// placeholders to the matching release-branch row.
export type ProcedureBlock = {
  templateId: number | null;
  name: string;
  repo: string;
  body: string;
};

// A release target row the user fills in; drives ${pr_list} / ${pr_url} / etc.
export type ReleaseBranch = {
  repo: string;
  branch: string;
  pr: string;
};

export type ProcedureVariables = {
  branches: ReleaseBranch[];
  // Values for any other ${custom} placeholders found in the blocks.
  vars: Record<string, string>;
};

export const releaseProcedures = pgTable("release_procedures", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  language: text("language").notNull().default("ja").$type<ProcedureLanguage>(),
  blocks: jsonb("blocks").notNull().$type<ProcedureBlock[]>(),
  variables: jsonb("variables").notNull().$type<ProcedureVariables>(),
  createdBy: integer("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type ReleaseTemplate = typeof releaseTemplates.$inferSelect;
export type ReleaseProcedure = typeof releaseProcedures.$inferSelect;
