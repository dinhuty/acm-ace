import type { ReactNode } from "react";
import { Label } from "@/components/atoms/Label";
import { ErrorMessage } from "@/components/atoms/ErrorMessage";

type Props = {
  label: string;
  htmlFor?: string;
  error?: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
};

// Label above control (Apple HIG), error below. See docs coding-conventions.md.
export function FormField({ label, htmlFor, error, hint, children }: Props) {
  return (
    <div className="flex flex-col gap-xxs">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-caption text-stone">{hint}</p> : null}
      <ErrorMessage>{error}</ErrorMessage>
    </div>
  );
}
