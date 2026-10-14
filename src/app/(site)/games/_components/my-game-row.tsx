"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { ApiError, browserApi } from "@/lib/api";
import type { Game } from "@/types/api";

interface MyGameRowProps {
  game: Game;
}

export default function MyGameRow({ game }: MyGameRowProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const created = new Date(game.created_at);
  const createdLabel = Number.isNaN(created.getTime())
    ? game.created_at
    : created.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

  const isPublished = game.status === "published";

  async function remove() {
    if (busy) return;
    const confirmed = window.confirm(`Delete "${game.name}"? This cannot be undone.`);
    if (!confirmed) return;

    setBusy(true);
    setError(null);
    try {
      await browserApi.deleteMyGame(game.id);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = "/login";
        return;
      }
      setError(err instanceof Error ? err.message : "Could not delete game");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-border bg-bg p-4">
      <div
        className="size-16 shrink-0 rounded-lg"
        style={{ backgroundColor: game.bg }}
        aria-hidden
      />

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-text truncate">{game.name}</h3>
          <Badge
            label={isPublished ? "Published" : "Draft"}
            variant={isPublished ? "genre" : "default"}
          />
        </div>
        <p className="text-xs text-muted mt-1">Created {createdLabel}</p>
        {error && (
          <p className="text-xs text-red-700 mt-1" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/games/mine/${game.id}/edit`}
          className="inline-flex items-center justify-center h-9 px-4 text-sm rounded-full bg-bg text-text border border-border-strong hover:bg-surface font-semibold transition-colors"
        >
          Edit
        </Link>
        <Button variant="ghost" size="sm" onClick={remove} disabled={busy}>
          {busy ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </article>
  );
}
