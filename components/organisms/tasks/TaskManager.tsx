"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createTask,
  updateTask,
  deleteTask,
  type TaskInput,
} from "@/app/(app)/tasks/actions";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { TextArea } from "@/components/atoms/TextArea";
import { Select } from "@/components/atoms/Select";
import { Modal } from "@/components/atoms/Modal";
import { FormField } from "@/components/molecules/FormField";
import { ErrorMessage } from "@/components/atoms/ErrorMessage";

export type Task = {
  id: number;
  title: string;
  slackTaskUrl: string;
  slackReviewUrl: string;
  procedureId: number | null;
  docUrl: string;
  note: string;
};

type ProcedureOption = { id: number; title: string };

function LinkChip({ href, label }: { href: string; label: string }) {
  if (!href.trim()) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-xxs rounded-full border border-hairline bg-surface px-sm py-xxs text-caption text-slate transition-colors hover:border-primary hover:text-primary"
    >
      {label} <span aria-hidden>↗</span>
    </a>
  );
}

export function TaskManager({
  tasks,
  procedures,
}: {
  tasks: Task[];
  procedures: ProcedureOption[];
}) {
  const [edit, setEdit] = useState<
    { mode: "new" } | { mode: "edit"; task: Task } | null
  >(null);
  const router = useRouter();

  const procTitle = useMemo(() => {
    const m = new Map<number, string>();
    for (const p of procedures) m.set(p.id, p.title);
    return m;
  }, [procedures]);

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex items-center justify-between gap-sm">
        <p className="text-body-sm text-stone">
          {tasks.length} task · chỉ mình bạn thấy.
        </p>
        <Button type="button" onClick={() => setEdit({ mode: "new" })}>
          + New task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-body-sm text-stone">
          Chưa có task nào. Tạo task đầu tiên của bạn.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-md lg:grid-cols-2">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="flex flex-col gap-sm rounded-lg border border-hairline border-l-4 border-l-[#7c3aed] bg-canvas p-lg"
            >
              <div className="flex items-start justify-between gap-sm">
                <h3 className="text-heading-5 text-ink">{t.title}</h3>
                <div className="flex shrink-0 gap-xs">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setEdit({ mode: "edit", task: t })}
                  >
                    Edit
                  </Button>
                  <DeleteTaskButton id={t.id} onDone={() => router.refresh()} />
                </div>
              </div>

              <div className="flex flex-wrap gap-xs">
                <LinkChip href={t.slackTaskUrl} label="Slack task" />
                <LinkChip href={t.slackReviewUrl} label="Slack review" />
                <LinkChip href={t.docUrl} label="Document" />
              </div>

              {t.procedureId ? (
                <Link
                  href={`/release-procedure/${t.procedureId}`}
                  className="text-body-sm text-primary underline"
                >
                  🚀 {procTitle.get(t.procedureId) ?? "Release procedure"}
                </Link>
              ) : null}

              {t.note.trim() ? (
                <p className="whitespace-pre-wrap rounded-md bg-surface p-sm text-body-sm text-slate">
                  {t.note}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={edit !== null}
        onClose={() => setEdit(null)}
        title={edit?.mode === "edit" ? "Edit task" : "New task"}
      >
        {edit ? (
          <TaskForm
            procedures={procedures}
            initial={edit.mode === "edit" ? edit.task : undefined}
            onDone={() => {
              setEdit(null);
              router.refresh();
            }}
            onCancel={() => setEdit(null)}
          />
        ) : null}
      </Modal>
    </div>
  );
}

const EMPTY: TaskInput = {
  title: "",
  slackTaskUrl: "",
  slackReviewUrl: "",
  procedureId: null,
  docUrl: "",
  note: "",
};

function TaskForm({
  procedures,
  initial,
  onDone,
  onCancel,
}: {
  procedures: ProcedureOption[];
  initial?: Task;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<TaskInput>(
    initial
      ? {
          title: initial.title,
          slackTaskUrl: initial.slackTaskUrl,
          slackReviewUrl: initial.slackReviewUrl,
          procedureId: initial.procedureId,
          docUrl: initial.docUrl,
          note: initial.note,
        }
      : EMPTY,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = initial
        ? await updateTask(initial.id, form)
        : await createTask(form);
      if (res.ok) onDone();
      else setError(res.error);
    });
  }

  const procOptions = [
    { value: "", label: "— Không liên kết —" },
    ...procedures.map((p) => ({ value: String(p.id), label: p.title })),
  ];

  return (
    <div className="flex flex-col gap-md">
      <FormField label="Tên task" htmlFor="task-title">
        <Input
          id="task-title"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          placeholder="AIRCLOSET-129956 …"
        />
      </FormField>
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <FormField label="Link Slack task" htmlFor="task-slack">
          <Input
            id="task-slack"
            value={form.slackTaskUrl}
            onChange={(e) =>
              setForm((p) => ({ ...p, slackTaskUrl: e.target.value }))
            }
            placeholder="https://…slack.com/…"
          />
        </FormField>
        <FormField label="Link Slack review" htmlFor="task-review">
          <Input
            id="task-review"
            value={form.slackReviewUrl}
            onChange={(e) =>
              setForm((p) => ({ ...p, slackReviewUrl: e.target.value }))
            }
            placeholder="https://…slack.com/…"
          />
        </FormField>
      </div>
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <FormField label="Release procedure" htmlFor="task-proc">
          <Select
            id="task-proc"
            value={form.procedureId ? String(form.procedureId) : ""}
            onChange={(v) =>
              setForm((p) => ({ ...p, procedureId: v ? Number(v) : null }))
            }
            options={procOptions}
            placeholder="— Không liên kết —"
          />
        </FormField>
        <FormField label="Link document" htmlFor="task-doc">
          <Input
            id="task-doc"
            value={form.docUrl}
            onChange={(e) => setForm((p) => ({ ...p, docUrl: e.target.value }))}
            placeholder="https://…"
          />
        </FormField>
      </div>
      <FormField label="Note" htmlFor="task-note">
        <TextArea
          id="task-note"
          rows={5}
          value={form.note}
          onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
          placeholder="Ghi chú cá nhân…"
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

function DeleteTaskButton({ id, onDone }: { id: number; onDone: () => void }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="danger"
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Delete this task?")) return;
        startTransition(async () => {
          await deleteTask(id);
          onDone();
        });
      }}
    >
      {pending ? "…" : "Delete"}
    </Button>
  );
}
