import type { Metadata } from "next";
import Link from "next/link";
import { serverApi } from "@/lib/api";
import type {
  CategoryDetailResponse,
  Game,
  GameListFilter,
  GameSort,
  MasterOption,
} from "@/types/api";
import BrowseSearchBar from "./_components/browse-search-bar";
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

function parseSort(value: string | string[] | undefined): GameSort {
  const v = Array.isArray(value) ? value[0] : value;
  if (v === "popular" || v === "most_liked" || v === "newest") return v;
  return "popular";
}

const SORT_LABEL: Record<GameSort, string> = {
  popular: "popularity",
  most_liked: "most liked",
  newest: "newest",
};

function filterFromParams(params: SearchParams): GameListFilter {
  return {
    genre_id: parseSingle(params.genre_id),
    platform_id: parseSingle(params.platform_id),
    q: parseSingle(params.q),
    sort: parseSort(params.sort),
    page: 1,
    limit: PAGE_SIZE,
  };
}

const EMPTY_MASTER: MasterOption = { genres: [], platforms: [], play_styles: [], player_counts: [] };
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

  const genreName = filter.genre_id
    ? master.genres.find((g) => g.id === filter.genre_id)?.name
    : undefined;
  const platformName = filter.platform_id
    ? master.platforms.find((p) => p.id === filter.platform_id)?.name
    : undefined;

  const title = genreName && platformName
    ? `${genreName} · ${platformName}`
    : genreName ?? platformName ?? "All games";

  const sortLabel = SORT_LABEL[filter.sort ?? "popular"];
  const countLabel = `${items.length} ${items.length === 1 ? "game" : "games"} · sorted by ${sortLabel}`;

  return (
    <div className="max-w-340 mx-auto px-4 sm:px-6 lg:px-10 py-6 pb-16">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-text transition-colors">Home</Link>
        <span className="mx-1.5">/</span>
        <span>Categories</span>
        <span className="mx-1.5">/</span>
        <span className="text-text font-semibold">{title}</span>
      </nav>

      <header className="flex flex-wrap items-baseline justify-between gap-2 mt-2.5 mb-7">
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight text-text">
          {title}
        </h1>
        <span aria-live="polite" className="text-sm text-muted">{countLabel}</span>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-8">
        <FilterSidebar
          master={master}
          genreCounts={category?.genres}
          platformCounts={category?.platforms}
        />

        <section className="flex flex-col gap-5 min-w-0">
          <div className="flex flex-wrap items-end gap-3">
            <BrowseSearchBar title={title} />
            <SortDropdown />
          </div>

          <GameGrid
            key={`${filter.sort ?? ""}|${filter.genre_id ?? ""}|${filter.platform_id ?? ""}|${filter.q ?? ""}`}
            initialItems={items}
            filter={filter}
            pageSize={PAGE_SIZE}
          />
        </section>
      </div>
    </div>
  );
}
