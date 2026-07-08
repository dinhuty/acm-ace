"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { restoreMdDocRevision } from "@/app/(app)/md-docs/actions";
import { Button } from "@/components/atoms/Button";
import { lineDiff } from "@/components/organisms/md-docs/diff";

export type RevisionRow = {
  id: number;
  body: string;
  savedByName: string | null;
  createdAt: Date;
};

export function MdDocHistory({
  docId,
  currentBody,
  revisions,
}: {
  docId: number;
  currentBody: string;
  revisions: RevisionRow[];
}) {
  const [sel, setSel] = useState<number | null>(revisions[0]?.id ?? null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const rev = revisions.find((r) => r.id === sel) ?? null;
  const diff = rev ? lineDiff(rev.body, currentBody) : [];

  if (revisions.length === 0) {
    return (
      <p className="text-body-sm text-stone">
        Chưa có phiên bản cũ — lịch sử được lưu mỗi lần sửa nội dung.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-md lg:grid-cols-[260px_1fr]">
      <div className="flex flex-col gap-xs lg:sticky lg:top-20 lg:h-fit">
        {revisions.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setSel(r.id)}
            className={`flex flex-col gap-xxs rounded-md px-sm py-xs text-left transition-colors ${
              r.id === sel ? "bg-primary/10 text-primary" : "text-slate hover:bg-surface"
            }`}
          >
            <span className="text-body-sm">{r.createdAt.toLocaleString()}</span>
            <span className="text-caption text-stone">{r.savedByName ?? "—"}</span>
          </button>
        ))}
      </div>

      <div className="flex min-w-0 flex-col gap-sm">
        {rev ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-sm">
              <span className="text-caption text-stone">
                So với bản hiện tại —{" "}
                <span className="text-brand-error">đỏ: chỉ ở bản cũ</span>,{" "}
                <span className="text-brand-green-deep">xanh: bản hiện tại</span>
              </span>
              <Button
                variant="secondary"
                type="button"
                disabled={pending}
                onClick={() => {
                  if (!window.confirm("Khôi phục doc về phiên bản này?")) return;
                  startTransition(async () => {
                    await restoreMdDocRevision(docId, rev.id);
                    router.push(`/md-docs/${docId}`);
                  });
                }}
              >
                {pending ? "…" : "Khôi phục bản này"}
              </Button>
            </div>
            <pre className="max-h-[70vh] overflow-auto rounded-md border border-hairline bg-canvas p-md font-mono text-code-sm">
              {diff.map((l, i) => (
                <div
                  key={i}
                  className={
                    l.type === "add"
                      ? "text-brand-green-deep"
                      : l.type === "del"
                        ? "text-brand-error"
                        : "text-slate"
                  }
                >
                  {l.type === "add" ? "+ " : l.type === "del" ? "- " : "  "}
                  {l.text}
                </div>
              ))}
            </pre>
          </>
        ) : (
          <p className="text-body-sm text-stone">Chọn phiên bản để xem diff.</p>
        )}
      </div>
    </div>
  );
}
