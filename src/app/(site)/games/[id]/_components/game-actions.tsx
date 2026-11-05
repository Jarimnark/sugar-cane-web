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
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const playLinks: { href: string; top: string; big: string; label: string }[] = [];
  if (game.link_web) playLinks.push({ href: game.link_web, top: "Play in", big: "Browser", label: "Play in browser" });
  if (game.link_android) playLinks.push({ href: game.link_android, top: "Get it on", big: "Android", label: "Download on Android" });
  if (game.link_ios) playLinks.push({ href: game.link_ios, top: "Download on", big: "iOS", label: "Download on iOS" });

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

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable (non-https or denied)
    }
  }

  function trackPlay() {
    void browserApi.trackGameEvent(game.id, "play").catch(() => {});
  }

  return (
    <div className="flex flex-col gap-3">
      {playLinks.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2.5">
            {playLinks.map((pl) => (
              <a
                key={pl.href}
                href={pl.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={pl.label}
                onClick={trackPlay}
                className="flex-1 min-w-45 h-14 px-4 rounded-2xl bg-accent text-text font-bold inline-flex items-center gap-2.5 hover:opacity-90 transition-opacity"
              >
                <GlobeIcon className="size-6 shrink-0" />
                <span className="flex flex-col leading-tight text-left">
                  <span className="text-xs font-semibold opacity-80">{pl.top}</span>
                  <span className="text-lg font-extrabold">{pl.big}</span>
                </span>
              </a>
            ))}
          </div>
          <p className="text-[13px] text-muted text-center">
            Opens the developer&apos;s site or app store in a new tab
          </p>
        </>
      )}

      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={toggleSave}
          disabled={busy}
          aria-label={saved ? "Remove from list" : "Add to list"}
          aria-pressed={saved}
          className={`flex-1 h-12 rounded-full inline-flex items-center justify-center gap-2 font-bold text-[15px] border transition-colors cursor-pointer disabled:cursor-not-allowed ${
            saved
              ? "bg-[#F2FAF3] border-[#CDEBD2] text-text"
              : "bg-bg border-border text-text hover:bg-surface"
          }`}
        >
          {saved ? <BookmarkFilledIcon className="size-4.5" /> : <PlusIcon className="size-4.5" />}
          {saved ? "In your list" : "Add to list"}
        </button>

        <button
          type="button"
          onClick={toggleLike}
          disabled={busy}
          aria-label={liked ? "Unlike" : "Like"}
          aria-pressed={liked}
          className={`h-12 px-4 rounded-full inline-flex items-center gap-2 font-bold text-[15px] border transition-colors cursor-pointer disabled:cursor-not-allowed ${
            liked
              ? "bg-accent/10 border-accent text-text"
              : "bg-bg border-border text-text hover:bg-surface"
          }`}
        >
          <ThumbsUpIcon className="size-4.5" filled={liked} />
          {likeCount.toLocaleString()}
        </button>

        <button
          type="button"
          onClick={handleShare}
          aria-label="Copy link to this page"
          className="size-12 rounded-full border border-border bg-bg inline-flex items-center justify-center hover:bg-surface transition-colors cursor-pointer shrink-0"
        >
          <LinkIcon className="size-4.5" />
        </button>
      </div>

      {copied && (
        <span role="status" className="text-sm font-bold text-[#1F7A2E]">
          Link copied
        </span>
      )}
    </div>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z" />
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
    <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 10v11" />
      <path d="M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.6l-2.3 7A2 2 0 0 1 17.5 21H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h2.8a2 2 0 0 0 1.8-1.1L12 3a3.1 3.1 0 0 1 3 2.9z" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </svg>
  );
}
