"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createMdDoc,
  updateMdDoc,
  deleteMdDoc,
  type MdDocInput,
} from "@/app/(app)/md-docs/actions";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { TextArea } from "@/components/atoms/TextArea";
import { Modal } from "@/components/atoms/Modal";
import { Pagination } from "@/components/atoms/Pagination";
import { FormField } from "@/components/molecules/FormField";
import { ErrorMessage } from "@/components/atoms/ErrorMessage";
import { CopyButton } from "@/components/atoms/CopyButton";
import { MarkdownPreview } from "@/components/organisms/release-procedure/MarkdownPreview";
import { usePaged } from "@/lib/use-paged";

export type MdDocRow = {
  id: number;
  title: string;
  body: string;
  tags: string[];
  updatedAt: Date;
  updatedByName: string | null;
};

export function MdDocLibrary({
  docs,
  openDocId,
}: {
  docs: MdDocRow[];
  openDocId?: number | null;
}) {
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(
    openDocId ?? docs[0]?.id ?? null,
  );
  const [showRaw, setShowRaw] = useState(false);
  const [edit, setEdit] = useState<
    { mode: "new" } | { mode: "edit"; doc: MdDocRow } | null
  >(null);
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (openDocId) setSelectedId(openDocId);
  }, [openDocId]);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    for (const d of docs) for (const t of d.tags) s.add(t);
    return [...s].sort();
  }, [docs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return docs.filter((d) => {
      if (tagFilter && !d.tags.includes(tagFilter)) return false;
      if (!q) return true;
      return `${d.title} ${d.body} ${d.tags.join(" ")}`
        .toLowerCase()
        .includes(q);
    });
  }, [docs, query, tagFilter]);

  const { page, setPage, totalPages, total, pageItems } = usePaged(filtered, 25);
  const selected = docs.find((d) => d.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-md">
      <div className="grid grid-cols-1 gap-md lg:grid-cols-[300px_1fr]">
        {/* ---------- Left: list ---------- */}
        <div className="flex flex-col gap-sm lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)]">
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm doc…"
            className="shrink-0"
          />
          <Button
            type="button"
            onClick={() => setEdit({ mode: "new" })}
            className="shrink-0"
          >
            + New doc
          </Button>
          {allTags.length > 0 ? (
            <div className="flex flex-wrap gap-xs">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setTagFilter(tagFilter === tag ? null : tag);
                    setPage(1);
                  }}
                  className={`rounded-full px-sm py-xxs text-caption transition-colors ${
                    tagFilter === tag
                      ? "bg-primary text-on-primary"
                      : "bg-surface text-steel hover:text-primary"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          ) : null}
          <div className="shrink-0">
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              onPage={setPage}
            />
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-auto pr-xxs">
            {total === 0 ? (
              <p className="text-body-sm text-stone">Không có doc nào.</p>
            ) : (
              pageItems.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedId(d.id)}
                  className={`flex flex-col gap-xxs rounded-md px-sm py-xs text-left transition-colors ${
                    d.id === selectedId
                      ? "bg-primary/10 text-primary"
                      : "text-slate hover:bg-surface"
                  }`}
                >
                  <span className="truncate text-body-sm font-medium">
                    {d.title}
                  </span>
                  {d.tags.length > 0 ? (
                    <span className="truncate text-micro text-stone">
                      {d.tags.map((t) => `#${t}`).join(" ")}
                    </span>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </div>

        {/* ---------- Right: rendered doc ---------- */}
        <div className="min-w-0 lg:sticky lg:top-20 lg:h-fit">
          {!selected ? (
            <div className="rounded-lg border border-hairline bg-canvas p-xl text-body-sm text-stone">
              Chọn một doc ở danh sách bên trái, hoặc tạo mới.
            </div>
          ) : (
            <div className="flex flex-col gap-md rounded-lg border border-hairline bg-canvas p-lg">
              <div className="flex flex-wrap items-start justify-between gap-sm">
                <div className="flex flex-col gap-xxs">
                  <h2 className="text-heading-4 text-ink">{selected.title}</h2>
                  <span className="text-caption text-stone">
                    {selected.tags.map((t) => `#${t}`).join(" ")}
                    {selected.updatedByName
                      ? `${selected.tags.length ? " · " : ""}Sửa bởi ${selected.updatedByName} · ${selected.updatedAt.toLocaleDateString()}`
                      : ""}
                  </span>
                </div>
                <div className="flex flex-wrap gap-xs">
                  <Button
                    variant={showRaw ? "secondary" : "primary"}
                    type="button"
                    onClick={() => setShowRaw(false)}
                  >
                    Preview
                  </Button>
                  <Button
                    variant={showRaw ? "primary" : "secondary"}
                    type="button"
                    onClick={() => setShowRaw(true)}
                  >
                    Raw
                  </Button>
                  <CopyButton text={selected.body} />
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setEdit({ mode: "edit", doc: selected })}
                  >
                    Edit
                  </Button>
                  <DeleteMdDocButton
                    id={selected.id}
                    onDone={() => {
                      setSelectedId(null);
                      router.refresh();
                    }}
                  />
                </div>
              </div>
              <div className="max-h-[calc(100vh-14rem)] overflow-auto">
                {showRaw ? (
                  <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-code-sm text-slate">
                    {selected.body}
                  </pre>
                ) : (
                  <MarkdownPreview markdown={selected.body} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={edit !== null}
        onClose={() => setEdit(null)}
        title={edit?.mode === "edit" ? "Edit doc" : "New doc"}
        size="wide"
      >
        {edit ? (
          <MdDocForm
            initial={edit.mode === "edit" ? edit.doc : undefined}
            onDone={(id) => {
              setEdit(null);
              if (id) setSelectedId(id);
              router.refresh();
            }}
            onCancel={() => setEdit(null)}
          />
        ) : null}
      </Modal>
    </div>
  );
}

function MdDocForm({
  initial,
  onDone,
  onCancel,
}: {
  initial?: MdDocRow;
  onDone: (id?: number) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [tagsText, setTagsText] = useState(initial?.tags.join(", ") ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    const input: MdDocInput = {
      title,
      body,
      tags: tagsText.split(","),
    };
    startTransition(async () => {
      const res = initial
        ? await updateMdDoc(initial.id, input)
        : await createMdDoc(input);
      if (res.ok) onDone(res.id);
      else setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-md">
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <FormField label="Tiêu đề" htmlFor="md-title">
          <Input
            id="md-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tên document…"
          />
        </FormField>
        <FormField label="Tags" htmlFor="md-tags" hint="Cách nhau bởi dấu phẩy">
          <Input
            id="md-tags"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="release, note, guide"
          />
        </FormField>
      </div>
      <FormField label="Nội dung (Markdown)" htmlFor="md-body">
        <TextArea
          id="md-body"
          mono
          rows={18}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={"# Tiêu đề\n\nNội dung markdown…"}
        />
      </FormField>
      <ErrorMessage>{error}</ErrorMessage>
      <div className="flex justify-end gap-xs">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={submit} disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

function DeleteMdDocButton({
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
        if (!window.confirm("Xoá doc này?")) return;
        startTransition(async () => {
          await deleteMdDoc(id);
          onDone();
        });
      }}
    >
      {pending ? "…" : "Delete"}
    </Button>
  );
}
