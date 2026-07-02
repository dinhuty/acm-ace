import type { ReactNode } from "react";

export function ErrorMessage({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="text-caption text-brand-error">{children}</p>;
}
