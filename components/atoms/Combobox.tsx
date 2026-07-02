"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  id?: string;
};

// Editable dropdown: pick a known option OR type a custom value (free text is
// always accepted). Suggestions filter by the current input. Used for `repo`
// and `category` where there's a fixed list but arbitrary values are allowed.
export function Combobox({ value, onChange, options, placeholder, id }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const q = value.trim().toLowerCase();
  const filtered = options
    .filter((o) => o.toLowerCase().includes(q) && o !== value)
    .slice(0, 50);

  return (
    <div ref={ref} className="relative w-full">
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="h-12 w-full rounded-md border border-hairline bg-canvas px-sm text-body-md text-ink outline-none transition-colors placeholder:text-muted hover:border-stone focus:border-primary"
      />
      {open && filtered.length > 0 ? (
        <div className="absolute z-30 mt-xxs max-h-60 w-full overflow-auto rounded-md border border-hairline bg-canvas p-xxs shadow-lg">
          {filtered.map((o) => (
            <button
              key={o}
              type="button"
              // onMouseDown (not onClick) so the input's blur doesn't dismiss
              // the panel before the selection registers.
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(o);
                setOpen(false);
              }}
              className="block w-full truncate rounded-sm px-xs py-xs text-left text-body-sm text-slate transition-colors hover:bg-surface"
            >
              {o}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
