import type { Metadata } from "next";
import GameCard from "@/components/ui/game-card";
import type { Game } from "@/types/api";

export const metadata: Metadata = {
  title: "Browse",
  description: "Browse all web games on SugarCane.",
};

export default async function BrowsePage() {
  const res = await fetch("http://localhost:3000/api/games", { cache: "no-store" }).catch(() => null);
  const games: Game[] = res?.ok ? ((await res.json()) as { games: Game[] }).games : [];

  return (
    <div className="max-w-340 mx-auto px-4 sm:px-6 lg:px-10 py-10">
      <h1 className="font-display font-extrabold text-3xl tracking-tight text-text mb-8">
        Browse games
      </h1>

      {games.length === 0 ? (
        <p className="text-muted">No games found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} showSave />
          ))}
        </div>
      )}
    </div>
  );
}
