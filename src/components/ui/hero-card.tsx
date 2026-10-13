"use client";

import Link from "next/link";
import { useState } from "react";
import type { Game } from "@/types/api";

interface HeroCardProps {
  game: Game;
}

export default function HeroCard({ game }: HeroCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(game.likeCount);
  const [saved, setSaved] = useState(false);

  async function toggleLike() {
    const res = await fetch(`/api/games/${game.slug}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json() as { liked: boolean; likeCount: number };
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    }
  }

  async function toggleSave() {
    const res = await fetch(`/api/games/${game.slug}/save`, { method: "POST" });
    if (res.ok) {
      const data = await res.json() as { saved: boolean };
      setSaved(data.saved);
    }
  }

  return (
    <div className="relative rounded-3xl overflow-hidden min-h-110 flex flex-col justify-end p-8 sm:p-12 bg-hero-bg">
      {/* Decorative circles — top-right corner */}
      <div className="absolute -top-20 -right-20 size-96 rounded-full bg-hero-circle pointer-events-none" />
      <div className="absolute top-8 right-8 size-64 rounded-full border-4 border-hero-ring pointer-events-none" />
      <div className="absolute top-24 right-24 size-28 rounded-2xl rotate-12 bg-hero-square pointer-events-none" />

      {/* Content */}
      <div className="relative flex flex-col gap-5 max-w-xl">
        {/* Badge */}
        <span className="inline-flex items-center self-start bg-accent text-text text-xs font-bold uppercase tracking-widest rounded-full px-3.5 py-1.5">
          #1 Most popular this week
        </span>

        {/* Title */}
        <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl leading-none tracking-[-0.03em] text-text">
          {game.name}
        </h1>

        {/* Genre tags */}
        <div className="flex flex-wrap gap-2">
          {game.genre.map((g) => (
            <span key={g} className="bg-white text-text text-sm font-bold rounded-full px-3.5 py-1">
              {g}
            </span>
          ))}
        </div>

        {/* Pitch */}
        <p className="text-lg leading-snug max-w-lg text-hero-text">
          {game.pitch}
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <a
            href={game.link}
            target="_blank"
            rel="noopener noreferrer"
            className="h-13 px-6 rounded-full bg-accent text-text font-bold text-nav inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <PlayIcon className="size-4.5" />
            Play now
            <ExternalIcon className="size-3.5 opacity-60" />
          </a>

          <Link
            href={`/games/${game.slug}`}
            className="h-13 px-6 rounded-full bg-white text-text font-bold text-nav inline-flex items-center border border-border hover:bg-surface transition-colors"
          >
            View game page
          </Link>

          <button
            type="button"
            onClick={toggleSave}
            aria-label={saved ? "Remove from list" : "Save to list"}
            className={`size-13 rounded-full inline-flex items-center justify-center border transition-colors cursor-pointer ${
              saved
                ? "bg-accent/10 border-accent"
                : "bg-white border-border hover:bg-surface"
            }`}
          >
            <BookmarkIcon className="size-5" filled={saved} />
          </button>

          <button
            type="button"
            onClick={toggleLike}
            aria-label={liked ? "Unlike" : "Like"}
            className={`h-13 px-5 rounded-full inline-flex items-center gap-2 text-nav font-semibold border transition-colors cursor-pointer ${
              liked
                ? "bg-accent/10 border-accent text-text"
                : "bg-white border-border text-text hover:bg-surface"
            }`}
          >
            <HeartIcon className="size-4.5" filled={liked} />
            {likeCount.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function BookmarkIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "#FFE07A" : "none"}
      stroke={filled ? "#B58900" : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" />
    </svg>
  );
}

function HeartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "#5cd068" : "none"}
      stroke={filled ? "#5cd068" : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
