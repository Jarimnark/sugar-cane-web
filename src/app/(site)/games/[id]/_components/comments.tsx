"use client";

import { useState } from "react";
import Button from "@/components/ui/button";
import Select from "@/components/ui/select";
import { useSession } from "@/hooks/useSession";
import { ApiError, browserApi } from "@/lib/api";
import type { CommentListResponse, CommentSort, GameComment } from "@/types/api";

interface CommentsProps {
  gameId: string;
  gameName: string;
  initial: CommentListResponse;
}

const MAX_LENGTH = 500;

const pastelPalette = [
  "bg-[#ffe3c7] text-[#7a4a1e]",
  "bg-[#d8eaff] text-[#1e3f7a]",
  "bg-[#e3daff] text-[#4d4766]",
  "bg-[#ffd9e0] text-[#7a1e3f]",
  "bg-[#d4f1d6] text-[#1e5a2a]",
  "bg-[#fff4b5] text-[#7a661e]",
];

function pastelFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % pastelPalette.length;
  return pastelPalette[idx];
}

function initialOf(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toUpperCase();
}

function relTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const secs = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d ago`;
  return d.toLocaleDateString();
}

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "top", label: "Top" },
];

export default function Comments({ gameId, gameName, initial }: CommentsProps) {
  const session = useSession();
  const [items, setItems] = useState<GameComment[]>(initial.items);
  const [count, setCount] = useState<number>(initial.count);
  const [sort, setSort] = useState<CommentSort>("newest");
  const [sortBusy, setSortBusy] = useState(false);

  async function handleSortChange(next: CommentSort) {
    if (next === sort) return;
    setSort(next);
    setSortBusy(true);
    try {
      const res = await browserApi.getGameComments(gameId, { sort: next });
      setItems(res.items);
      setCount(res.count);
    } finally {
      setSortBusy(false);
    }
  }

  async function handleCreated(created: GameComment) {
    setItems((prev) => [created, ...prev]);
    setCount((c) => c + 1);
    try {
      const res = await browserApi.getGameComments(gameId, { sort });
      setItems(res.items);
      setCount(res.count);
    } catch {
      // keep optimistic state
    }
  }

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((c) => c.id !== id));
    setCount((c) => Math.max(0, c - 1));
  }

  return (
    <section className="flex flex-col gap-6 max-w-[820px]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display font-bold text-[26px] tracking-tight text-text">
          Comments <span className="text-muted font-semibold text-xl">{count}</span>
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">Sort</span>
          <div className="w-32">
            <Select
              value={sort}
              options={sortOptions}
              disabled={sortBusy}
              onChange={(e) => handleSortChange(e.target.value as CommentSort)}
            />
          </div>
        </div>
      </div>

      {session.loading ? (
        <div className="rounded-2xl border border-border bg-surface h-28" />
      ) : (
        <Composer
          gameId={gameId}
          gameName={gameName}
          user={session.user ?? null}
          onCreated={handleCreated}
        />
      )}

      <ul className="flex flex-col">
        {items.map((comment, idx) => (
          <li
            key={comment.id}
            className={idx === 0 ? "py-5" : "py-5 border-t border-border"}
          >
            <CommentRow comment={comment} onDeleted={handleDeleted} />
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-sm text-muted py-5">Be the first to comment.</li>
        )}
      </ul>
    </section>
  );
}

interface ComposerProps {
  gameId: string;
  gameName: string;
  user: { id: string; display_name: string } | null;
  onCreated: (c: GameComment) => void;
}

function Composer({ gameId, gameName, user, onCreated }: ComposerProps) {
  const [content, setContent] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = content.trim();
  const disabled = trimmed.length === 0 || busy;
  const showAsAnon = !user || anonymous;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    setBusy(true);
    setError(null);
    try {
      const created = await browserApi.createComment(gameId, {
        content: trimmed,
        anonymous: showAsAnon,
      });
      onCreated(created);
      setContent("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = `/login?next=/games/${gameId}`;
        return;
      }
      setError(err instanceof ApiError ? err.message : "Failed to post comment");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-bg p-5 sm:p-6 flex flex-col gap-4"
    >
      <div className="flex items-center gap-3">
        {showAsAnon || !user ? (
          <AnonAvatar />
        ) : (
          <Avatar seed={user.id} name={user.display_name} />
        )}
        <p className="text-sm text-muted">
          Posting as{" "}
          <span className="font-semibold text-text">
            {showAsAnon ? "Anonymous" : user!.display_name}
          </span>
        </p>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={MAX_LENGTH}
        rows={3}
        placeholder={`Share what you think about ${gameName}…`}
        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none transition-colors placeholder:text-muted focus:border-accent resize-none"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        {user ? (
          <label className="inline-flex items-center gap-2 text-sm text-text cursor-pointer">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="size-4 accent-accent cursor-pointer"
            />
            Post as Anonymous
          </label>
        ) : (
          <p className="text-sm text-muted">
            You&apos;re not logged in.{" "}
            <a href={`/login?next=/games/${gameId}`} className="font-bold text-text hover:underline">
              Log in
            </a>{" "}
            to use your name.
          </p>
        )}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">
            {content.length}/{MAX_LENGTH}
          </span>
          <Button type="submit" variant="primary" size="sm" disabled={disabled}>
            {busy ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}


interface CommentRowProps {
  comment: GameComment;
  onDeleted: (id: string) => void;
}

function CommentRow({ comment, onDeleted }: CommentRowProps) {
  const [liked, setLiked] = useState(comment.liked);
  const [likeCount, setLikeCount] = useState(comment.like_count);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleLike() {
    if (busy) return;
    setBusy(true);
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    try {
      if (next) await browserApi.likeComment(comment.id);
      else await browserApi.unlikeComment(comment.id);
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

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await browserApi.deleteComment(comment.id);
      onDeleted(comment.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete");
      setDeleting(false);
    }
  }

  return (
    <div className="flex gap-3">
      {comment.anonymous ? (
        <AnonAvatar />
      ) : (
        <Avatar seed={comment.user_id} name={comment.author_name} />
      )}

      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-text">{comment.author_name}</span>
          {comment.is_developer && (
            <span className="inline-flex items-center rounded-full bg-accent/15 text-text text-xs font-bold px-2 py-0.5">
              Developer
            </span>
          )}
          <span className="text-xs text-muted">· {relTime(comment.created_at)}</span>
          {comment.is_own && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="ml-auto text-xs text-muted hover:text-text cursor-pointer disabled:cursor-not-allowed"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>

        <p className="text-sm text-text whitespace-pre-wrap break-words">
          {comment.content}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLike}
            disabled={busy}
            aria-pressed={liked}
            aria-label={liked ? "Unlike comment" : "Like comment"}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed ${
              liked
                ? "bg-accent/10 border-accent text-text"
                : "bg-bg border-border text-muted hover:bg-surface"
            }`}
          >
            <ThumbIcon className="size-3.5" filled={liked} />
            {likeCount}
          </button>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}

interface AvatarProps {
  seed: string;
  name: string;
}

function Avatar({ seed, name }: AvatarProps) {
  const key = seed || name;
  const palette = pastelFor(key.slice(0, 6));
  return (
    <div
      className={`size-10 shrink-0 rounded-full inline-flex items-center justify-center font-display font-bold text-base ${palette}`}
    >
      {initialOf(name)}
    </div>
  );
}

function AnonAvatar() {
  return (
    <div className="size-10 shrink-0 rounded-full border border-dashed border-border inline-flex items-center justify-center text-muted font-display font-bold text-base">
      ?
    </div>
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
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H7a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L13 2h0a3 3 0 0 1 2 3.88z" />
    </svg>
  );
}
