"use client";

import Link from "next/link";
import { useState } from "react";
import type { Game } from "@/types/api";

interface GameTileProps {
  game: Game;
}

export default function GameTile({ game }: GameTileProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(game.likeCount);
  const [saved, setSaved] = useState(false);

  async function toggleLike(e: React.MouseEvent) {
    e.preventDefault();
    const res = await fetch(`/api/games/${game.slug}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json() as { liked: boolean; likeCount: number };
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    }
  }

  async function toggleSave(e: React.MouseEvent) {
    e.preventDefault();
    const res = await fetch(`/api/games/${game.slug}/save`, { method: "POST" });
    if (res.ok) {
      const data = await res.json() as { saved: boolean };
      setSaved(data.saved);
    }
  }

  const displayCount = likeCount >= 1000
    ? `${(likeCount / 1000).toFixed(1)}k`
    : String(likeCount);

  return (
    <div className="group relative flex w-115 max-w-[84vw] h-65 rounded-[18px] overflow-hidden flex-none border border-border bg-bg">
      {/* Art side — expands to full width, collapses to half on hover */}
      <div
        className="relative flex-[0_0_100%] group-hover:flex-[0_0_50%] transition-[flex-basis] duration-[280ms] ease-in-out overflow-hidden"
        style={{ background: game.bg }}
      >
        {/* Decorative circle */}
        <div className="absolute -right-10 -bottom-15 size-55 rounded-full bg-black/10 pointer-events-none" />

        {/* Bottom overlay with title + genre */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-14 bg-gradient-to-t from-black/65 to-transparent">
          <p className="font-display font-bold text-2xl leading-tight text-white line-clamp-1">
            {game.name}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {game.genre.map((g) => (
              <span
                key={g}
                className="bg-white/20 text-white text-xs font-bold rounded-full px-2.5 py-0.5 backdrop-blur-sm"
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={toggleSave}
          aria-label={saved ? "Remove from list" : "Save to list"}
          className={`absolute top-3 right-3 size-11 rounded-full bg-white flex items-center justify-center shadow-sm transition-colors cursor-pointer hover:bg-surface ${
            saved ? "ring-2 ring-accent" : ""
          }`}
        >
          <BookmarkIcon className="size-4.5" filled={saved} />
        </button>
      </div>

      {/* Info panel — always 50% width, revealed as art collapses */}
      <div className="flex-none w-1/2 h-full px-4.5 py-4 border-l border-border flex flex-col gap-1.5 bg-bg">
        <Link
          href={`/games/${game.slug}`}
          className="font-display font-bold text-base leading-tight text-text hover:text-accent transition-colors line-clamp-2"
        >
          {game.name}
        </Link>

        <p className="text-xs text-muted">
          {game.domain} · {game.platforms.join(", ")}
        </p>

        <p className="text-xs text-muted leading-[1.45] line-clamp-3 flex-1">
          {game.pitch}
        </p>

        <div className="flex gap-2 mt-auto pt-1">
          <a
            href={game.link}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 flex-1 rounded-full bg-accent text-text font-bold text-sm inline-flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <PlayIcon className="size-3.5" />
            Play
            <ExternalIcon className="size-3 opacity-60" />
          </a>

          <button
            type="button"
            onClick={toggleLike}
            aria-label={liked ? "Unlike" : "Like"}
            className={`h-10 px-3 rounded-full inline-flex items-center gap-1.5 text-sm font-semibold border transition-colors cursor-pointer ${
              liked
                ? "bg-accent/10 border-accent text-text"
                : "bg-bg border-border text-muted hover:border-border-strong"
            }`}
          >
            <HeartIcon className="size-3.5" filled={liked} />
            {displayCount}
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
