"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
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

  const genreCountMap = new Map(genreCounts?.map((g) => [g.id, g.game_count]) ?? []);
  const platformCountMap = new Map(platformCounts?.map((p) => [p.id, p.game_count]) ?? []);

  const genreTotal = genreCounts?.reduce((n, g) => n + g.game_count, 0);
  const platformTotal = platformCounts?.reduce((n, p) => n + p.game_count, 0);

  return (
    <aside
      aria-label="Categories"
      className={`flex flex-col gap-1 ${pending ? "opacity-70" : ""} transition-opacity`}
    >
      <SectionLabel>Genre</SectionLabel>
      <FilterRow
        label="All games"
        count={genreTotal}
        active={!selectedGenre}
        onClick={() => pushParams({ genre_id: null })}
      />
      {master.genres.map((g) => (
        <FilterRow
          key={g.id}
          label={g.name}
          count={genreCountMap.get(g.id)}
          active={selectedGenre === g.id}
          onClick={() => pushParams({ genre_id: g.id })}
        />
      ))}

      <SectionLabel className="mt-3 pt-3 border-t border-border">Platform</SectionLabel>
      <FilterRow
        label="Any platform"
        count={platformTotal}
        active={!selectedPlatform}
        onClick={() => pushParams({ platform_id: null })}
      />
      {master.platforms.map((p) => (
        <FilterRow
          key={p.id}
          label={p.name}
          count={platformCountMap.get(p.id)}
          active={selectedPlatform === p.id}
          onClick={() => pushParams({ platform_id: p.id })}
        />
      ))}
    </aside>
  );
}

function SectionLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`px-3 py-2 text-xs font-bold tracking-widest uppercase text-muted ${className}`}
    >
      {children}
    </span>
  );
}

interface FilterRowProps {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}

function FilterRow({ label, count, active, onClick }: FilterRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex justify-between items-center h-10.5 px-3 rounded-lg text-left text-nav transition-colors cursor-pointer ${
        active
          ? "bg-accent/15 text-text font-bold"
          : "bg-transparent text-text font-semibold hover:bg-surface"
      }`}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span className="text-xs text-muted font-semibold">{count}</span>
      )}
    </button>
  );
}
