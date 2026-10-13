"use client";

import Link from "next/link";
import { useState } from "react";
import Badge from "@/components/ui/badge";
import { ApiError, browserApi } from "@/lib/api";
import type { Game } from "@/types/api";

export type GameCardVariant = "default" | "compact";

interface GameCardProps {
  game: Game;
  variant?: GameCardVariant;
  showSave?: boolean;
}

export default function GameCard({ game, variant = "default", showSave }: GameCardProps) {
  const [liked, setLiked] = useState(Boolean(game.liked));
  const [likeCount, setLikeCount] = useState(game.like_count);
  const [saved, setSaved] = useState(Boolean(game.in_my_list));
  const [busy, setBusy] = useState(false);
  const showSaveButton = showSave ?? true;
  const isCompact = variant === "compact";

  async function toggleLike() {
    if (busy) return;
    setBusy(true);
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    try {
      if (next) await browserApi.likeGame(game.id);
      else await browserApi.unlikeGame(game.id);
    } catch (err) {
      setLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = "/login";
      }
    } finally {
      setBusy(false);
    }
  }

  async function toggleSave() {
    if (busy) return;
    setBusy(true);
    const next = !saved;
    setSaved(next);
    try {
      if (next) await browserApi.addToMyList(game.id);
      else await browserApi.removeFromMyList(game.id);
    } catch (err) {
      setSaved(!next);
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = "/login";
      }
    } finally {
      setBusy(false);
    }
  }

  function trackClick() {
    void browserApi.trackGameEvent(game.id, "click").catch(() => {});
  }

  const artHeight = isCompact ? "h-28" : "h-36";

  return (
    <article className="flex flex-col rounded-xl border border-border overflow-hidden bg-bg hover:shadow-lg transition-shadow">
      <Link
        href={`/games/${game.slug}`}
        onClick={trackClick}
        className={`block ${artHeight} shrink-0`}
        tabIndex={-1}
        aria-hidden
      >
        <div className="w-full h-full" style={{ backgroundColor: game.bg }} />
      </Link>

      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/games/${game.slug}`}
            onClick={trackClick}
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

        {!isCompact && <p className="text-xs text-muted line-clamp-2">{game.pitch}</p>}

        <div className="flex flex-wrap gap-1 mt-auto pt-2">
          {game.tags.map((t) => (
            <Badge key={t} label={t} variant="genre" />
          ))}
        </div>

        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={toggleLike}
            aria-label={liked ? "Unlike" : "Like"}
            aria-pressed={liked}
            disabled={busy}
            className="flex items-center gap-1 text-xs text-muted hover:text-text transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <HeartIcon filled={liked} className="w-3.5 h-3.5" />
            {likeCount}
          </button>

          {showSaveButton && (
            <button
              type="button"
              onClick={toggleSave}
              aria-label={saved ? "Remove from list" : "Save to list"}
              aria-pressed={saved}
              disabled={busy}
              className={`ml-auto text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed ${
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
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
