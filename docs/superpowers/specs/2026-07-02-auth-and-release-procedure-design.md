# Design: Auth + Release Procedure tool

Date: 2026-07-02
Status: Approved (user said "làm luôn đi nhé … làm liên tục")

## Goal

Add to the **Zen** multi-tool app:

1. **Auth** — username + password register & login (internal tool, minimal validation).
   No Supabase; use Next.js native primitives (`cookies`, `proxy.ts`, Server Actions)
   over the existing Drizzle + pg stack.
2. **Home** — a grid of tool cards; only **Release Procedure** is live, the rest are
   "coming soon" placeholders.
3. **Release Procedure tool** — store & create release procedure checklists from
   reusable, trilingual (JA / EN / VI) templates that are shared master data editable
   by every user.

## Decisions (from brainstorming)

| Question | Decision |
|---|---|
| Auth stack | Custom, on Drizzle + pg. `scrypt` (Node built-in) password hash. **DB sessions** — opaque 256-bit random token in an httpOnly cookie, looked up in a `sessions` table. No `jose`, no extra deps. |
| Route protection | `proxy.ts` (Next 16 renamed middleware) does an **optimistic** check (cookie present?) only. Real verification in a DAL (`getCurrentUser`, `cache`d) used by the `(app)` layout + every Server Action. Auth pages self-redirect authed users (real check) to avoid redirect loops on stale cookies. |
| Template vs Procedure | **Separate.** Templates = master data. Procedures = saved tasks built from templates. |
| Language | Master data is trilingual — each template stores `bodyJa / bodyEn / bodyVi`. A procedure picks **one** language; blocks snapshot that language's text. "Choose language" = the content-language selector in the builder. |
| Step toggle | Granularity = **block/template level** (matches esa source, which stores each block as one text blob per language). "Skip a step" = don't tick that template (e.g. skip the submodule/sync block). |
| Branch ordering | Selected blocks are **drag-reorderable** (native HTML5 DnD, no lib). |
| Title | `AIRCLOSET-` fixed prefix + free text input; stored combined. |
| Markdown | Bodies are real markdown (` ```sql `, `- [ ]`, `1. **…**`). Preview rendered with `react-markdown` + `remark-gfm`; a **Raw** toggle shows the source; **Copy** copies the source. |
| Editing | Each block body is editable inline in the builder (fill PR links / SHA / etc.). Procedure snapshots the edited text — later master edits don't mutate saved procedures. |
| UI chrome i18n | Out of scope (English labels). No `lib/i18n` system this pass (YAGNI). |
| Seed | Curated trilingual starter set (Common blocks + a few repos) from the esa export; the rest is added via the in-app editable master data. |

Out of scope (YAGNI): Supabase, `jose`/iron-session, full UI i18n, per-line step toggles,
importing the *entire* 20-repo esa master, roles/permissions.

## Data model (Drizzle / Postgres — local `zen-db` on :5450)

- `users(id serial pk, username text unique, password_hash text, created_at)`
- `sessions(id text pk /* random token */, user_id → users cascade, expires_at, created_at)`
- `release_templates(id serial pk, category text, name text unique, body_ja text, body_en text, body_vi text, created_at, updated_at, updated_by → users setnull)`
- `release_procedures(id serial pk, title text, language text /* ja|en|vi */, blocks jsonb, created_by → users setnull, created_at, updated_at)`
  - `blocks: { templateId: number | null; name: string; body: string }[]` — ordered snapshot.

## Layers

- `lib/auth/password.ts` — `hashPassword` / `verifyPassword` (scrypt + timingSafeEqual).
- `lib/auth/session.ts` — `createSession` / `destroySession` (server-only, cookies + DB).
- `lib/auth/dal.ts` — `getCurrentUser` (cache), `requireUser` (redirects to /login).
- `lib/release-procedure/markdown.ts` — `procedureToMarkdown(title, language, blocks)`.
- `proxy.ts` — redirect unauthenticated users on protected routes to `/login`.

## Routes (App Router, route groups)

- `app/(auth)/layout.tsx` — centered card (public). `login/`, `register/` each with `page.tsx` + `actions.ts`.
- `app/(app)/layout.tsx` — `requireUser()`, header (app name + username + Sign out). `page.tsx` = home tool grid.
- `app/(app)/release-procedure/`
  - `page.tsx` — list saved procedures + "New" + "Manage templates".
  - `actions.ts` — create / update / delete procedure.
  - `new/page.tsx`, `[id]/page.tsx` (view), `[id]/edit/page.tsx`.
  - `templates/page.tsx` + `templates/actions.ts` — trilingual master CRUD.

## Components (atoms → molecules → organisms, per structure.md)

- atoms: `Button`, `Input`, `Label`, `ErrorMessage`, `TextArea`.
- molecules: `FormField`.
- organisms: `LoginForm`, `RegisterForm`, `SignOutButton`, `AppHeader`, `ToolGrid`,
  `TemplateManager`, `ProcedureBuilder`, `MarkdownPreview`.

## Safety / notes

- Every mutating Server Action calls `requireUser()` first (proxy alone is not a security boundary — Server Actions are POSTs to their route).
- All release data is shared master data (no per-user row ownership), so authorization = "is logged in".
- `secure` cookie flag only in production (local dev is http).
