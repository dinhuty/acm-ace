import type { TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & { mono?: boolean };

export function TextArea({ className = "", mono = false, ...props }: Props) {
  return (
    <textarea
      className={`w-full rounded-md border border-hairline bg-canvas p-sm text-ink outline-none transition-colors placeholder:text-muted hover:border-stone focus:border-primary disabled:opacity-50 ${
        mono ? "font-mono text-code-sm" : "text-body-md"
      } ${className}`}
      {...props}
    />
  );
}
