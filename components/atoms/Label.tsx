import type { LabelHTMLAttributes } from "react";

export function Label({
  className = "",
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`text-body-sm-medium text-slate ${className}`}
      {...props}
    />
  );
}
