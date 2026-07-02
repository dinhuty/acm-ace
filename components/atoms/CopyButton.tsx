"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/Button";

export function CopyButton({
  text,
  label = "Copy markdown",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (e.g. insecure context) — no-op; user can select Raw.
    }
  }

  return (
    <Button type="button" variant="secondary" onClick={copy}>
      {copied ? "Copied ✓" : label}
    </Button>
  );
}
