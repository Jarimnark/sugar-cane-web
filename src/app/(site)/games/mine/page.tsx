import type { Metadata } from "next";
import Link from "next/link";
import { serverApi } from "@/lib/api";
import MyGameRow from "../_components/my-game-row";

export const metadata: Metadata = {
  title: "My Games",
};

export default async function MyGamesPage() {
  const items = await serverApi.getMyGames();

  const sorted = [...items].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="font-display font-extrabold text-3xl tracking-tight text-text">
          My games
        </h1>
        <Link
          href="/games/new"
          className="inline-flex items-center justify-center h-11 px-5 text-nav rounded-full bg-accent text-text font-semibold hover:opacity-90 transition-opacity"
        >
          Add game
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-10 text-center">
          <p className="text-text font-semibold mb-2">No games yet</p>
          <p className="text-muted text-sm mb-6">
            Add your first game to see it listed here.
          </p>
          <Link
            href="/games/new"
            className="inline-flex items-center justify-center h-11 px-5 text-nav rounded-full bg-accent text-text font-semibold hover:opacity-90 transition-opacity"
          >
            Add your first game
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((game) => (
            <MyGameRow key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
