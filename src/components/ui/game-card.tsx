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

  function trackPlay() {
    void browserApi.trackGameEvent(game.id, "play").catch(() => {});
  }

  const artHeight = isCompact ? "h-28" : "h-36";

  return (
    <article className="relative flex flex-col rounded-xl border border-border overflow-hidden bg-bg hover:shadow-lg transition-shadow">
      <Link
        href={`/games/${game.id}`}
        onClick={trackClick}
        className={`block ${artHeight} shrink-0`}
        tabIndex={-1}
        aria-hidden
      >
        <div className="w-full h-full" style={{ backgroundColor: game.bg }} />
      </Link>

      {showSaveButton && (
        <button
          type="button"
          onClick={toggleSave}
          aria-label={saved ? "Remove from my list" : "Save to my list"}
          aria-pressed={saved}
          disabled={busy}
          className="absolute top-2 right-2 size-9 rounded-full bg-bg shadow-md inline-flex items-center justify-center text-text hover:bg-surface transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <BookmarkIcon filled={saved} className="size-4" />
        </button>
      )}

      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/games/${game.id}`}
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
            className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full border text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed ${
              liked
                ? "bg-accent/10 border-accent text-text"
                : "border-border text-muted hover:text-text"
            }`}
          >
            <ThumbIcon filled={liked} className="size-3.5" />
            {likeCount}
          </button>

          {game.link_web ? (
            <a
              href={game.link_web}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackPlay}
              className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-text hover:underline"
              aria-label={`Play ${game.name}`}
            >
              Play
              <ExternalIcon className="size-3" />
            </a>
          ) : (
            <Link
              href={`/games/${game.id}`}
              onClick={trackClick}
              className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-text hover:underline"
            >
              View
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function ThumbIcon({ className, filled }: { className?: string; filled?: boolean }) {
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
      <path d="M7 10v11" />
      <path d="M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.6l-2.3 7A2 2 0 0 1 17.5 21H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h2.8a2 2 0 0 0 1.8-1.1L12 3a3.1 3.1 0 0 1 3 2.9z" />
    </svg>
  );
}

function BookmarkIcon({ className, filled }: { className?: string; filled?: boolean }) {
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
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" />
    </svg>
  );
}

function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}
