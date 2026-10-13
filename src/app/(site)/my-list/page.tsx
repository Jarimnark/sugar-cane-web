import type { Metadata } from "next";
import Link from "next/link";
import GameCard from "@/components/ui/game-card";
import Button from "@/components/ui/button";
import { serverApi } from "@/lib/api";
import SortSelect from "./sort-select";

export const metadata: Metadata = {
  title: "My List",
};

type Sort = "added" | "name";

function parseSort(value: string | string[] | undefined): Sort {
  return value === "name" ? "name" : "added";
}

export default async function MyListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sort = parseSort(params.sort);
  const games = await serverApi.getMyList(sort);

  return (
    <div className="max-w-340 mx-auto px-4 sm:px-6 lg:px-10 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight text-text">
            My list
          </h1>
          <p className="text-muted mt-1">
            {games.length === 0
              ? "You haven't saved any games yet."
              : `${games.length} ${games.length === 1 ? "game" : "games"} saved`}
          </p>
        </div>
        {games.length > 0 && <SortSelect value={sort} />}
      </div>

      {games.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface py-20 px-6 text-center">
          <h2 className="font-display font-bold text-2xl text-text">
            Nothing saved yet
          </h2>
          <p className="text-muted max-w-md">
            Save games from Browse or the home page to build your personal shelf.
          </p>
          <Link href="/browse">
            <Button variant="primary">Browse games</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {games.map((g) => (
            <GameCard
              key={g.id}
              game={{ ...g, in_my_list: true }}
              showSave
            />
          ))}
        </div>
      )}
    </div>
  );
}
