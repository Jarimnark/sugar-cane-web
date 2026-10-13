import type { Metadata } from "next";
import Link from "next/link";
import { MOCK_GAMES } from "@/lib/mock-data";
import HeroCard from "@/components/ui/hero-card";
import GameTile from "@/components/ui/game-tile";

export const metadata: Metadata = {
  title: "Home",
  description: "Discover and share web games.",
};

export default function HomePage() {
  const byPopularity = [...MOCK_GAMES].sort((a, b) => b.likeCount - a.likeCount);
  const heroGame = byPopularity[0];
  const popularGames = byPopularity.slice(1);

  return (
    <div className="max-w-340 mx-auto px-4 sm:px-6 lg:px-10 py-10 flex flex-col gap-12">
      {/* Hero */}
      <HeroCard game={heroGame} />

      {/* Most Popular */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-3xl tracking-tight text-text">
            Most Popular
          </h2>
          <Link
            href="/browse?sort=popular"
            className="text-nav font-semibold text-muted hover:text-text transition-colors"
          >
            See all
          </Link>
        </div>
        <div className="-mx-4 sm:-mx-6 lg:-mx-10">
          <div className="flex gap-5 overflow-x-auto py-1 px-4 sm:px-6 lg:px-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {popularGames.map((game) => (
              <GameTile key={game.id} game={game} />
            ))}
          </div>
        </div>
      </section>

      {/* New this week */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-3xl tracking-tight text-text">
            New this week
          </h2>
          <Link
            href="/browse?sort=newest"
            className="text-nav font-semibold text-muted hover:text-text transition-colors"
          >
            See all
          </Link>
        </div>
        <div className="-mx-4 sm:-mx-6 lg:-mx-10">
          <div className="flex gap-5 overflow-x-auto py-1 px-4 sm:px-6 lg:px-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {MOCK_GAMES.map((game) => (
              <GameTile key={game.id} game={game} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
