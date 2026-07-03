"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createSnippet,
  updateSnippet,
  deleteSnippet,
  type SnippetInput,
} from "@/app/(app)/sql-runner/actions";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { TextArea } from "@/components/atoms/TextArea";
import { Combobox } from "@/components/atoms/Combobox";
import { FormField } from "@/components/molecules/FormField";
import { ErrorMessage } from "@/components/atoms/ErrorMessage";
import { CopyButton } from "@/components/atoms/CopyButton";

export type Snippet = {
  id: number;
  category: string;
  title: string;
  body: string;
};

export function SnippetLibrary({ snippets }: { snippets: Snippet[] }) {
  const [query, setQuery] = useState("");
  const [edit, setEdit] = useState<
    { mode: "new" } | { mode: "edit"; snippet: Snippet } | null
  >(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const router = useRouter();

  const categories = useMemo(
    () => [...new Set(snippets.map((s) => s.category).filter(Boolean))].sort(),
    [snippets],
  );

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = q
      ? snippets.filter((s) =>
          `${s.title} ${s.category} ${s.body}`.toLowerCase().includes(q),
        )
      : snippets;
    const map = new Map<string, Snippet[]>();
    for (const s of matched) {
      const key = s.category || "Uncategorized";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [snippets, query]);

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-wrap items-center justify-between gap-sm">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm snippet (tên / category / nội dung SQL)…"
          className="max-w-[28rem]"
        />
        {edit ? null : (
          <Button type="button" onClick={() => setEdit({ mode: "new" })}>
            + New snippet
          </Button>
        )}
      </div>

      {edit ? (
        <SnippetForm
          key={edit.mode === "edit" ? edit.snippet.id : "new"}
          categories={categories}
          initial={edit.mode === "edit" ? edit.snippet : undefined}
          onDone={() => {
            setEdit(null);
            router.refresh();
          }}
          onCancel={() => setEdit(null)}
        />
      ) : null}

      {grouped.length === 0 ? (
        <p className="text-body-sm text-stone">Không có snippet nào khớp.</p>
      ) : (
        grouped.map(([cat, list]) => (
          <div key={cat} className="flex flex-col gap-xs">
            <h3 className="text-micro-uppercase text-stone">
              {cat} ({list.length})
            </h3>
            {list.map((s) => (
              <div
                key={s.id}
                className="flex flex-col gap-xs rounded-lg border border-hairline bg-canvas p-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-sm">
                  <span className="text-body-md-medium text-ink">{s.title}</span>
                  <div className="flex flex-wrap gap-xs">
                    <CopyButton text={s.body} label="Copy SQL" />
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() =>
                        setOpenId((id) => (id === s.id ? null : s.id))
                      }
                    >
                      {openId === s.id ? "Ẩn" : "Xem SQL"}
                    </Button>
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => setEdit({ mode: "edit", snippet: s })}
                    >
                      Edit
                    </Button>
                    <DeleteSnippetButton
                      id={s.id}
                      onDone={() => router.refresh()}
                    />
                  </div>
                </div>
                {openId === s.id ? (
                  <pre className="overflow-x-auto whitespace-pre rounded-md bg-surface-code p-sm font-mono text-code-sm text-on-dark">
                    {s.body}
                  </pre>
                ) : null}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

const EMPTY: SnippetInput = { category: "", title: "", body: "" };

function SnippetForm({
  categories,
  initial,
  onDone,
  onCancel,
}: {
  categories: string[];
  initial?: Snippet;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<SnippetInput>(
    initial
      ? { category: initial.category, title: initial.title, body: initial.body }
      : EMPTY,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof SnippetInput>(key: K, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = initial
        ? await updateSnippet(initial.id, form)
        : await createSnippet(form);
      if (res.ok) onDone();
      else setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-md rounded-lg border border-primary bg-canvas p-lg">
      <h3 className="text-heading-5 text-ink">
        {initial ? "Edit snippet" : "New snippet"}
      </h3>
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <FormField label="Category" htmlFor="snip-category">
          <Combobox
            id="snip-category"
            value={form.category}
            onChange={(v) => set("category", v)}
            options={categories}
            placeholder="rental"
          />
        </FormField>
        <FormField label="Title" htmlFor="snip-title">
          <Input
            id="snip-title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="reset-rental"
          />
        </FormField>
      </div>
      <FormField label="SQL" htmlFor="snip-body">
        <TextArea
          id="snip-body"
          mono
          rows={14}
          value={form.body}
          onChange={(e) => set("body", e.target.value)}
          placeholder="SELECT ... ;"
        />
      </FormField>
      <ErrorMessage>{error}</ErrorMessage>
      <div className="flex gap-xs">
        <Button type="button" onClick={submit} disabled={pending}>
          {pending ? "Saving…" : "Save snippet"}
        </Button>
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function DeleteSnippetButton({
  id,
  onDone,
}: {
  id: number;
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="danger"
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Delete this snippet?")) return;
        startTransition(async () => {
          await deleteSnippet(id);
          onDone();
        });
      }}
    >
      {pending ? "…" : "Delete"}
    </Button>
  );
}
