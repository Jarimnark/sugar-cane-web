"use client";

import type { OptionItem } from "@/types/api";

interface PlayStyleChipsProps {
  options: OptionItem[];
  selectedIds: string[];
  onChange: (next: string[]) => void;
  max: number;
  error?: string;
}

export default function PlayStyleChips({
  options,
  selectedIds,
  onChange,
  max,
  error,
}: PlayStyleChipsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-semibold text-text">Play style</span>
        <span className="text-xs text-muted">Pick 1 to {max}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((ps) => {
          const selected = selectedIds.includes(ps.id);
          const atMax = !selected && selectedIds.length >= max;
          return (
            <button
              key={ps.id}
              type="button"
              aria-pressed={selected}
              disabled={atMax}
              onClick={() =>
                onChange(
                  selected
                    ? selectedIds.filter((id) => id !== ps.id)
                    : [...selectedIds, ps.id],
                )
              }
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors cursor-pointer ${
                selected
                  ? "border-accent bg-accent text-text"
                  : atMax
                    ? "border-border bg-surface text-muted cursor-not-allowed"
                    : "border-border-strong bg-bg text-text hover:border-accent"
              }`}
            >
              {ps.name}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
      {selectedIds.length > 0 && !error && (
        <p className="text-xs text-muted">
          {selectedIds.length} of {max} picked
        </p>
      )}
    </div>
  );
}
