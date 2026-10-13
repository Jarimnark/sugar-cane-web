import type { Metadata } from "next";
import { serverApi } from "@/lib/api";
import type {
  CategoryDetailResponse,
  Game,
  GameListFilter,
  MasterOption,
} from "@/types/api";
import FilterSidebar from "./_components/filter-sidebar";
import GameGrid from "./_components/game-grid";
import SortDropdown from "./_components/sort-dropdown";

export const metadata: Metadata = {
  title: "Browse",
  description: "Browse all web games on SugarCane by genre and platform.",
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

type SearchParams = Record<string, string | string[] | undefined>;

function parseSingle(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value[0] || undefined;
  return value || undefined;
}

function parseSort(value: string | string[] | undefined): "popular" | "newest" | "az" {
  const v = Array.isArray(value) ? value[0] : value;
  if (v === "newest" || v === "az") return v;
  return "popular";
}

function filterFromParams(params: SearchParams): GameListFilter {
  return {
    genre_id: parseSingle(params.genre_id),
    platform_id: parseSingle(params.platform_id),
    sort: parseSort(params.sort),
    page: 1,
    limit: PAGE_SIZE,
  };
}

const EMPTY_MASTER: MasterOption = { genres: [], platforms: [] };
const EMPTY_LIST: Game[] = [];

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const filter = filterFromParams(params);

  const [listResult, masterResult, categoryResult] = await Promise.allSettled([
    serverApi.listGames(filter),
    serverApi.getMasterOptions(),
    serverApi.getCategoryDetail(),
  ]);

  const items = listResult.status === "fulfilled" ? listResult.value : EMPTY_LIST;
  const master = masterResult.status === "fulfilled" ? masterResult.value : EMPTY_MASTER;
  const category: CategoryDetailResponse | null =
    categoryResult.status === "fulfilled" ? categoryResult.value : null;

  const activeCount =
    (filter.genre_id ? 1 : 0) + (filter.platform_id ? 1 : 0);

  return (
    <div className="max-w-340 mx-auto px-4 sm:px-6 lg:px-10 py-10">
      <header className="flex flex-col gap-2 mb-8">
        <h1 className="font-display font-extrabold text-3xl tracking-tight text-text">
          Browse games
        </h1>
        <p className="text-sm text-muted">
          {items.length} game{items.length === 1 ? "" : "s"}
          {activeCount > 0 ? ` · ${activeCount} filter${activeCount === 1 ? "" : "s"} applied` : ""}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[18rem_1fr] gap-10">
        <FilterSidebar
          master={master}
          genreCounts={category?.genres}
          platformCounts={category?.platforms}
        />

        <section className="flex flex-col gap-6 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted">Showing {items.length}</p>
            <SortDropdown />
          </div>

          <GameGrid initialItems={items} filter={filter} pageSize={PAGE_SIZE} />
        </section>
      </div>
    </div>
  );
}
