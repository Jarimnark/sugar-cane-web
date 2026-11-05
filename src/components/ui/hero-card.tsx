"use client";

import Link from "next/link";
import { useState } from "react";
import { ApiError, browserApi } from "@/lib/api";
import type { Game } from "@/types/api";

interface HeroCardProps {
  game: Game;
}

export default function HeroCard({ game }: HeroCardProps) {
  const [liked, setLiked] = useState(Boolean(game.liked));
  const [likeCount, setLikeCount] = useState(game.like_count);
  const [saved, setSaved] = useState(Boolean(game.in_my_list));
  const [busy, setBusy] = useState(false);

  const headlineTags = game.tags.slice(0, 3);

  const playLinks: { href: string; label: string; top: string; big: string }[] = [];
  if (game.link_web) playLinks.push({ href: game.link_web, label: "Play in browser", top: "Play in", big: "Browser" });
  if (game.link_android) playLinks.push({ href: game.link_android, label: "Get it on Android", top: "Get it on", big: "Android" });
  if (game.link_ios) playLinks.push({ href: game.link_ios, label: "Download on iOS", top: "Download on", big: "iOS" });

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

  return (
    <div className="relative rounded-3xl overflow-hidden min-h-110 flex flex-col justify-end p-8 sm:p-12 bg-[#F1ECFF]">
      <div className="absolute -top-20 -right-20 size-96 rounded-full bg-[#E3DAFF] pointer-events-none" />
      <div className="absolute top-8 right-8 size-64 rounded-full border-4 border-[#C9B8F5] pointer-events-none" />
      <div className="absolute top-24 right-24 size-28 rounded-2xl rotate-12 bg-[#D6C9FB] pointer-events-none" />

      <div className="relative flex flex-col gap-5 max-w-xl">
        <span className="inline-flex items-center self-start bg-accent text-text text-xs font-bold uppercase tracking-widest rounded-full px-3.5 py-1.5">
          {game.badge ?? "#1 Most popular this week"}
        </span>

        <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl leading-none tracking-[-0.03em] text-text">
          {game.name}
        </h1>

        {headlineTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {headlineTags.map((t) => (
              <span key={t} className="bg-white text-text text-sm font-bold rounded-full px-3.5 py-1">
                {t}
              </span>
            ))}
          </div>
        )}

        <p className="text-lg leading-snug max-w-lg text-[#4D4766]">{game.pitch}</p>

        <div className="flex flex-wrap items-center gap-3 mt-1">
          {playLinks.map((pl) => (
            <a
              key={pl.href}
              href={pl.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={pl.label}
              className="h-14 px-4 rounded-2xl bg-accent text-text font-bold inline-flex items-center gap-2.5 hover:opacity-90 transition-opacity"
            >
              <GlobeIcon className="size-6" />
              <span className="flex flex-col leading-tight text-left">
                <span className="text-xs font-semibold opacity-80">{pl.top}</span>
                <span className="text-lg font-extrabold">{pl.big}</span>
              </span>
            </a>
          ))}

          <Link
            href={`/games/${game.id}`}
            className="h-13 px-6 rounded-full bg-white text-text font-bold text-nav inline-flex items-center border border-border hover:bg-surface transition-colors"
          >
            View game page
          </Link>

          <button
            type="button"
            onClick={toggleSave}
            disabled={busy}
            aria-label={saved ? "Remove from list" : "Save to list"}
            aria-pressed={saved}
            className="size-13 rounded-full inline-flex items-center justify-center border border-border bg-white hover:bg-surface transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {saved ? (
              <BookmarkFilledIcon className="size-5" />
            ) : (
              <PlusIcon className="size-5" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleLike}
            disabled={busy}
            aria-label={liked ? "Unlike" : "Like"}
            aria-pressed={liked}
            className={`h-13 px-5 rounded-full inline-flex items-center gap-2 text-nav font-semibold border transition-colors cursor-pointer disabled:cursor-not-allowed ${
              liked
                ? "bg-accent/10 border-accent text-text"
                : "bg-white border-border text-text hover:bg-surface"
            }`}
          >
            <ThumbsUpIcon className="size-4.5" filled={liked} />
            {likeCount.toLocaleString()}
          </button>
        </div>
      </div>
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
