"use client";

import Link from "next/link";
import { useState } from "react";
import Badge from "@/components/ui/badge";
import type { Game } from "@/types/api";

interface GameCardProps {
  game: Game;
  showSave?: boolean;
}

export default function GameCard({ game, showSave = false }: GameCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(game.likeCount);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggleLike() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/games/${game.slug}/like`, { method: "POST" });
      const data = (await res.json()) as { liked: boolean; likeCount: number };
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } finally {
      setLoading(false);
    }
  }

  async function toggleSave() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/games/${game.slug}/save`, { method: "POST" });
      const data = (await res.json()) as { saved: boolean };
      setSaved(data.saved);
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="flex flex-col rounded-xl border border-border overflow-hidden bg-bg hover:shadow-lg transition-shadow">
      <Link href={`/games/${game.slug}`} className="block h-36 shrink-0" tabIndex={-1} aria-hidden>
        <div className="w-full h-full" style={{ backgroundColor: game.bg }} />
      </Link>

      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/games/${game.slug}`}
            className="font-semibold text-text text-sm leading-snug hover:underline line-clamp-2"
          >
            {game.name}
          </Link>
          {game.badge && (
            <span className="shrink-0 rounded-full bg-accent/10 text-accent text-xs font-bold px-2 py-0.5">
              {game.badge}
            </span>
          )}
        </div>

        <p className="text-xs text-muted line-clamp-2">{game.pitch}</p>

        <div className="flex flex-wrap gap-1 mt-auto pt-2">
          {game.genre.map((g) => (
            <Badge key={g} label={g} variant="genre" />
          ))}
        </div>

        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={toggleLike}
            aria-label={liked ? "Unlike" : "Like"}
            className="flex items-center gap-1 text-xs text-muted hover:text-text transition-colors cursor-pointer"
          >
            <HeartIcon filled={liked} className="w-3.5 h-3.5" />
            {likeCount}
          </button>

          {showSave && (
            <button
              type="button"
              onClick={toggleSave}
              aria-label={saved ? "Remove from list" : "Save to list"}
              className={`ml-auto text-xs font-semibold transition-colors cursor-pointer ${
                saved ? "text-accent" : "text-muted hover:text-text"
              }`}
            >
              {saved ? "Saved" : "Save"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function HeartIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
