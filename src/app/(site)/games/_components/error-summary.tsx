"use client";

import { useEffect, useRef } from "react";

interface ErrorSummaryProps {
  errors: Record<string, string>;
}

const FIELD_LABELS: Record<string, string> = {
  name: "Game name",
  pitch: "One-line pitch",
  description: "Description",
  players: "Number of players",
  link_web: "Website link",
  link_android: "Google Play link",
  link_ios: "App Store link",
  links: "Play links",
  banner: "Banner image",
  genres: "Genre",
  platforms: "Platform",
  play_styles: "Play style",
};

function fieldLabel(key: string): string {
  if (key.startsWith("video_")) return "Trailer video link";
  return FIELD_LABELS[key] ?? key;
}

function scrollToField(key: string) {
  const el =
    document.getElementById(`field-${key}`) ?? document.getElementById(key);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  const focusable = el.querySelector<HTMLElement>(
    "input:not([type=hidden]), select, textarea, button, [tabindex]",
  );
  focusable?.focus({ preventScroll: true });
}

export default function ErrorSummary({ errors }: ErrorSummaryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const keys = Object.keys(errors);
  const hash = keys.join("|");

  useEffect(() => {
    if (keys.length > 0) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // Only re-scroll when the set of failing keys changes.
  }, [hash]); // eslint-disable-line react-hooks/exhaustive-deps

  if (keys.length === 0) return null;
  const word = keys.length === 1 ? "error" : "errors";

  return (
    <div
      ref={ref}
      role="alert"
      aria-live="polite"
      className="scroll-mt-24 rounded-xl border border-[#E9C3B5] bg-[var(--color-danger-surface,#FBEDE7)] px-4 py-3 text-sm text-[var(--color-danger,#9A4E39)]"
    >
      <p className="mb-2 font-semibold">
        Fix {keys.length} {word} below before submitting:
      </p>
      <ul className="list-disc space-y-1 pl-5">
        {keys.map((k) => (
          <li key={k}>
            <button
              type="button"
              onClick={() => scrollToField(k)}
              className="cursor-pointer text-left hover:underline"
            >
              <span className="font-semibold">{fieldLabel(k)}</span>
              <span> — {errors[k]}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
