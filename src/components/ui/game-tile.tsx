"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, browserApi } from "@/lib/api";
import type { Game } from "@/types/api";

interface GameTileProps {
  game: Game;
}

export default function GameTile({ game }: GameTileProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(Boolean(game.liked));
  const [likeCount, setLikeCount] = useState(game.like_count);
  const [saved, setSaved] = useState(Boolean(game.in_my_list));
  const [busy, setBusy] = useState(false);

  const chips = game.tags.slice(0, 2);

  async function toggleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
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

  async function toggleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
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

  const displayCount =
    likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}k` : String(likeCount);

  return (
    <div
      className="group relative flex w-115 max-w-[84vw] h-65 rounded-[18px] overflow-hidden flex-none border border-border bg-bg hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => router.push(`/games/${game.id}`)}
      role="link"
    >
      <div
        className="relative flex-[0_0_100%] group-hover:flex-[0_0_50%] transition-[flex-basis] duration-[280ms] ease-in-out overflow-hidden"
        style={{ background: game.bg }}
      >
        <div className="absolute -right-10 -bottom-15 size-55 rounded-full bg-black/10 pointer-events-none" />

        <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-14 bg-gradient-to-t from-black/65 to-transparent">
          <p className="font-display font-bold text-2xl leading-tight text-white line-clamp-1">
            {game.name}
          </p>
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {chips.map((t) => (
                <span
                  key={t}
                  className="bg-white text-text text-xs font-bold rounded-full px-2.5 py-0.5"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleSave}
          disabled={busy}
          aria-label={saved ? "Remove from list" : "Save to list"}
          aria-pressed={saved}
          className="absolute top-3 right-3 size-11 rounded-full bg-white flex items-center justify-center shadow-sm transition-colors cursor-pointer hover:bg-surface disabled:cursor-not-allowed"
        >
          {saved ? (
            <BookmarkFilledIcon className="size-4.5" />
          ) : (
            <PlusIcon className="size-4.5" />
          )}
        </button>
      </div>

      <div className="flex-none w-1/2 h-full px-4.5 py-4 border-l border-border flex flex-col gap-1.5 bg-bg">
        <Link
          href={`/games/${game.id}`}
          onClick={(e) => e.stopPropagation()}
          className="font-display font-bold text-base leading-tight text-text hover:text-accent transition-colors line-clamp-2"
        >
          {game.name}
        </Link>

        {(game.badge || game.dev) && (
          <p className="text-xs text-muted truncate">
            {[game.badge, game.dev].filter(Boolean).join(" · ")}
          </p>
        )}

        <p className="text-xs text-muted leading-[1.45] line-clamp-3 flex-1">
          {game.pitch}
        </p>

        <div className="flex gap-2 mt-auto pt-1">
          {game.link_web && (
            <a
              href={game.link_web}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="h-10 flex-1 rounded-full bg-accent text-text font-bold text-sm inline-flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <ExternalIcon className="size-3.5" />
              Play
            </a>
          )}

          <button
            type="button"
            onClick={toggleLike}
            disabled={busy}
            aria-label={liked ? "Unlike" : "Like"}
            aria-pressed={liked}
            className={`h-10 px-3 rounded-full inline-flex items-center gap-1.5 text-sm font-semibold border transition-colors cursor-pointer disabled:cursor-not-allowed ${
              liked
                ? "bg-accent/10 border-accent text-text"
                : "bg-bg border-border text-muted hover:border-border-strong"
            }`}
          >
            <ThumbsUpIcon className="size-3.5" filled={liked} />
            {displayCount}
          </button>
        </div>
      </div>
    </div>
  );
}

function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function BookmarkFilledIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#141A14" stroke="#141A14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" />
    </svg>
  );
}

function ThumbsUpIcon({ className, filled }: { className?: string; filled?: boolean }) {
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
