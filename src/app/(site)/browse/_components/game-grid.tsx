"use client";

import { useState } from "react";
import Button from "@/components/ui/button";
import GameCard from "@/components/ui/game-card";
import { ApiError, browserApi } from "@/lib/api";
import type { Game, GameListFilter } from "@/types/api";

interface GameGridProps {
  initialItems: Game[];
  filter: GameListFilter;
  pageSize: number;
}

export default function GameGrid({ initialItems, filter, pageSize }: GameGridProps) {
  const [items, setItems] = useState<Game[]>(initialItems);
  const [page, setPage] = useState<number>(filter.page ?? 1);
  const [hasMore, setHasMore] = useState<boolean>(initialItems.length >= pageSize);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    const nextPage = page + 1;
    try {
      const batch = await browserApi.listGames({
        ...filter,
        page: nextPage,
        limit: pageSize,
      });
      setItems((prev) => [...prev, ...batch]);
      setPage(nextPage);
      setHasMore(batch.length >= pageSize);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = "/login";
        return;
      }
      setError("Couldn't load more games. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center">
        <p className="font-display font-bold text-lg text-text">No games match these filters.</p>
        <p className="text-sm text-muted mt-1">Try removing a filter to see more games.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((game) => (
          <GameCard key={game.id} game={game} showSave />
        ))}
      </div>

      {hasMore && (
        <div className="flex flex-col items-center gap-2">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            variant="secondary"
            size="md"
            onClick={loadMore}
            disabled={loading}
            aria-label="Load more games"
          >
            {loading ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
