"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ProcedureBlock,
  ProcedureLanguage,
  ProcedureVariables,
} from "@/db/schema";
import { Button } from "@/components/atoms/Button";
import { Modal } from "@/components/atoms/Modal";
import {
  ProcedureBuilder,
  type TemplateLite,
} from "@/components/organisms/release-procedure/ProcedureBuilder";

type Props = {
  templates: TemplateLite[];
  procedure: {
    id: number;
    title: string;
    language: ProcedureLanguage;
    blocks: ProcedureBlock[];
    variables: ProcedureVariables;
  };
  label?: string;
  variant?: "primary" | "secondary" | "ghost";
};

// Edit a procedure inside a modal (instead of navigating to a separate page),
// so opening the editor never depends on / disturbs the page scroll position.
export function ProcedureEditModal({
  templates,
  procedure,
  label = "Edit",
  variant = "secondary",
}: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button variant={variant} type="button" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Edit — ${procedure.title}`}
        size="wide"
      >
        {open ? (
          <ProcedureBuilder
            templates={templates}
            initial={procedure}
            onSaved={() => {
              setOpen(false);
              router.refresh();
            }}
            onCancel={() => setOpen(false)}
          />
        ) : null}
      </Modal>
    </>
  );
}
