"use client";

import Link from "next/link";

interface SuccessOverlayProps {
  title: string;
  text: string;
  href: string;
  ctaLabel: string;
  onReset: () => void;
}

export default function SuccessOverlay({ title, text, href, ctaLabel, onReset }: SuccessOverlayProps) {
  return (
    <section className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-bg p-10">
      <span className="flex size-13 items-center justify-center rounded-full bg-[#D7EEEA]">
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="#2A6A60" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <h2 className="font-display font-extrabold text-2xl text-text">{title}</h2>
      <p className="max-w-xl text-text text-base leading-relaxed text-muted">{text}</p>
      <div className="mt-2 flex flex-wrap gap-3">
        <Link
          href={href}
          className="inline-flex h-12 items-center rounded-full bg-accent px-5 font-bold text-nav text-text hover:opacity-90 transition-opacity"
        >
          {ctaLabel}
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-12 items-center rounded-full border border-border-strong bg-bg px-5 font-bold text-nav text-text hover:bg-surface transition-colors cursor-pointer"
        >
          Add another game
        </button>
      </div>
    </section>
  );
}
