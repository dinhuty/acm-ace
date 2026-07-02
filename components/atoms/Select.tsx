"use client";

import { useEffect, useRef, useState } from "react";

export type SelectOption = { value: string; label: string };
export type SelectGroup = { label: string; options: SelectOption[] };

type Props = {
  value: string;
  onChange: (value: string) => void;
  options?: SelectOption[];
  groups?: SelectGroup[];
  placeholder?: string;
  disabled?: boolean;
  id?: string;
};

// Custom-styled dropdown (pick-only) replacing native <select>. Supports flat
// options or grouped (optgroup) options. Closes on click-outside / Escape.
export function Select({
  value,
  onChange,
  options,
  groups,
  placeholder = "Chọn…",
  disabled,
  id,
}: Props) {
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

  const flat = groups ? groups.flatMap((g) => g.options) : (options ?? []);
  const selected = flat.find((o) => o.value === value);

  function pick(v: string) {
    onChange(v);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex h-12 w-full items-center justify-between gap-sm rounded-md border border-hairline bg-canvas px-sm text-body-md text-ink outline-none transition-colors hover:border-stone focus:border-primary disabled:opacity-50"
      >
        <span className={selected ? "truncate" : "truncate text-muted"}>
          {selected?.label ?? placeholder}
        </span>
        <span className="text-stone">▾</span>
      </button>

      {open ? (
        <div className="absolute z-30 mt-xxs max-h-72 w-full overflow-auto rounded-md border border-hairline bg-canvas p-xxs shadow-lg">
          {groups
            ? groups.map((g) => (
                <div key={g.label}>
                  <div className="px-xs pt-xs pb-xxs text-micro-uppercase text-stone">
                    {g.label}
                  </div>
                  {g.options.map((o) => (
                    <OptionRow
                      key={o.value}
                      option={o}
                      active={o.value === value}
                      onPick={pick}
                    />
                  ))}
                </div>
              ))
            : (options ?? []).map((o) => (
                <OptionRow
                  key={o.value}
                  option={o}
                  active={o.value === value}
                  onPick={pick}
                />
              ))}
        </div>
      ) : null}
    </div>
  );
}

function OptionRow({
  option,
  active,
  onPick,
}: {
  option: SelectOption;
  active: boolean;
  onPick: (v: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(option.value)}
      className={`block w-full truncate rounded-sm px-xs py-xs text-left text-body-sm transition-colors ${
        active ? "bg-primary text-on-primary" : "text-slate hover:bg-surface"
      }`}
    >
      {option.label}
    </button>
  );
}
