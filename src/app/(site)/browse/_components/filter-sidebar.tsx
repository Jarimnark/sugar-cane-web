"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import FilterChip from "@/components/ui/filter-chip";
import type { CategoryItem, MasterOption } from "@/types/api";

interface FilterSidebarProps {
  master: MasterOption;
  genreCounts?: CategoryItem[];
  platformCounts?: CategoryItem[];
}

export default function FilterSidebar({ master, genreCounts, platformCounts }: FilterSidebarProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const selectedGenre = params.get("genre_id");
  const selectedPlatform = params.get("platform_id");

  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      }
      next.delete("page");
      startTransition(() => {
        router.push(`/browse${next.toString() ? `?${next.toString()}` : ""}`, { scroll: false });
      });
    },
    [params, router],
  );

  function toggle(key: "genre_id" | "platform_id", id: string, current: string | null) {
    pushParams({ [key]: current === id ? null : id });
  }

  const hasAnyFilter = Boolean(selectedGenre) || Boolean(selectedPlatform);

  function clearAll() {
    const next = new URLSearchParams(params.toString());
    next.delete("genre_id");
    next.delete("platform_id");
    next.delete("page");
    startTransition(() => {
      router.push(`/browse${next.toString() ? `?${next.toString()}` : ""}`, { scroll: false });
    });
  }

  const genreCountMap = new Map(genreCounts?.map((g) => [g.id, g.game_count]) ?? []);
  const platformCountMap = new Map(platformCounts?.map((p) => [p.id, p.game_count]) ?? []);

  return (
    <aside
      aria-label="Filters"
      className={`flex flex-col gap-6 ${pending ? "opacity-70" : ""} transition-opacity`}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-lg text-text">Filters</h2>
        {hasAnyFilter && (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm font-semibold text-muted hover:text-text transition-colors cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      <FilterGroup title="Genre">
        {master.genres.map((g) => (
          <FilterChip
            key={g.id}
            label={g.name}
            count={genreCountMap.get(g.id)}
            active={selectedGenre === g.id}
            onChange={() => toggle("genre_id", g.id, selectedGenre)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Platform">
        {master.platforms.map((p) => (
          <FilterChip
            key={p.id}
            label={p.name}
            count={platformCountMap.get(p.id)}
            active={selectedPlatform === p.id}
            onChange={() => toggle("platform_id", p.id, selectedPlatform)}
          />
        ))}
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-xs font-bold tracking-widest uppercase text-muted">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
