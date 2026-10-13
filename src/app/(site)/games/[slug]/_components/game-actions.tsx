"use client";

import { useState } from "react";
import { ApiError, browserApi } from "@/lib/api";
import type { Game } from "@/types/api";

interface GameActionsProps {
  game: Game;
}

export default function GameActions({ game }: GameActionsProps) {
  const [liked, setLiked] = useState(Boolean(game.liked));
  const [likeCount, setLikeCount] = useState(game.like_count);
  const [saved, setSaved] = useState(Boolean(game.in_my_list));
  const [busy, setBusy] = useState(false);

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

  function trackPlay() {
    void browserApi.trackGameEvent(game.id, "play").catch(() => {});
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={game.link_web}
        target="_blank"
        rel="noopener noreferrer"
        onClick={trackPlay}
        className="h-13 px-6 rounded-full bg-accent text-text font-bold text-nav inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
      >
        <PlayIcon className="size-4.5" />
        Play now
        <ExternalIcon className="size-3.5 opacity-60" />
      </a>

      <button
        type="button"
        onClick={toggleSave}
        aria-label={saved ? "Remove from list" : "Save to list"}
        aria-pressed={saved}
        disabled={busy}
        className={`size-13 rounded-full inline-flex items-center justify-center border transition-colors cursor-pointer disabled:cursor-not-allowed ${
          saved
            ? "bg-accent/10 border-accent"
            : "bg-bg border-border hover:bg-surface"
        }`}
      >
        <BookmarkIcon className="size-5" filled={saved} />
      </button>

      <button
        type="button"
        onClick={toggleLike}
        aria-label={liked ? "Unlike" : "Like"}
        aria-pressed={liked}
        disabled={busy}
        className={`h-13 px-5 rounded-full inline-flex items-center gap-2 text-nav font-semibold border transition-colors cursor-pointer disabled:cursor-not-allowed ${
          liked
            ? "bg-accent/10 border-accent text-text"
            : "bg-bg border-border text-text hover:bg-surface"
        }`}
      >
        <HeartIcon className="size-4.5" filled={liked} />
        {likeCount.toLocaleString()}
      </button>
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
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
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
