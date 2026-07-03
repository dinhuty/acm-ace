"use client";

import { Button } from "@/components/atoms/Button";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  onPage: (page: number) => void;
};

// Compact pagination bar — placed at the top of every list.
export function Pagination({ page, totalPages, total, onPage }: Props) {
  return (
    <div className="flex items-center justify-between gap-sm">
      <span className="text-caption text-stone">
        {total} kết quả · trang {page}/{totalPages}
      </span>
      <div className="flex gap-xs">
        <Button
          variant="secondary"
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          aria-label="Trang trước"
        >
          ‹
        </Button>
        <Button
          variant="secondary"
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          aria-label="Trang sau"
        >
          ›
        </Button>
      </div>
    </div>
  );
}
