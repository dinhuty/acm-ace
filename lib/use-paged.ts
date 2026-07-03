import { useState } from "react";

// Client-side pagination over an already-filtered list. Page auto-clamps when
// the list shrinks (e.g. after a search), so callers just reset to 1 on search.
export function usePaged<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, totalPages);
  const pageItems = items.slice((current - 1) * pageSize, current * pageSize);
  return { page: current, setPage, totalPages, total: items.length, pageItems };
}
