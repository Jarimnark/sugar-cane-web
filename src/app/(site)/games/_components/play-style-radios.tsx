"use client";

import type { PlayStyleSlug } from "@/types/api";
import { PLAY_STYLE_LABELS, PLAY_STYLE_ORDER } from "@/lib/catalog";

interface PlayStyleRadiosProps {
  value: PlayStyleSlug | "";
  onChange: (next: PlayStyleSlug) => void;
  error?: string;
}

export default function PlayStyleRadios({ value, onChange, error }: PlayStyleRadiosProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-text">Play style</span>
      <div className="flex flex-wrap gap-2">
        {PLAY_STYLE_ORDER.map((slug) => {
          const selected = value === slug;
          return (
            <button
              key={slug}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(slug)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors cursor-pointer ${
                selected
                  ? "border-accent bg-accent text-text"
                  : "border-border-strong bg-bg text-text hover:border-accent"
              }`}
            >
              {PLAY_STYLE_LABELS[slug]}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
