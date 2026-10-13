"use client";

interface FilterChipProps {
  label: string;
  count?: number;
  active: boolean;
  onChange: (active: boolean) => void;
}

export default function FilterChip({ label, count, active, onChange }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors cursor-pointer ${
        active
          ? "bg-accent text-bg font-bold"
          : "bg-surface text-muted font-semibold hover:text-text"
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`text-xs ${active ? "opacity-70" : "opacity-60"}`}>
          {count}
        </span>
      )}
    </button>
  );
}
