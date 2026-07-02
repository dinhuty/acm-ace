import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-12 w-full rounded-md border border-hairline bg-canvas px-sm text-body-md text-ink outline-none transition-colors placeholder:text-muted hover:border-stone focus:border-primary disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
