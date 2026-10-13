import type { Metadata } from "next";
import Link from "next/link";
import { serverApi } from "@/lib/api";
import HeroCard from "@/components/ui/hero-card";
import GameCard from "@/components/ui/game-card";
import type { Game } from "@/types/api";

export const metadata: Metadata = {
  title: "Home",
  description: "Discover and share web games.",
};

export default async function HomePage() {
  const home = await serverApi.getHome();
  const hero = home.trending[0];

  return (
    <div className="max-w-340 mx-auto px-4 sm:px-6 lg:px-10 py-10 flex flex-col gap-12">
      {hero ? <HeroCard game={hero} /> : <EmptyHero />}

      <GameSection
        title="Trending"
        seeAllHref="/browse?sort=trending"
        games={home.trending.slice(1)}
      />

      <GameSection
        title="Most Popular"
        seeAllHref="/browse?sort=popular"
        games={home.popular}
      />

      <GameSection
        title="New this week"
        seeAllHref="/browse?sort=newest"
        games={home.new}
      />
    </div>
  );
}

function GameSection({
  title,
  seeAllHref,
  games,
}: {
  title: string;
  seeAllHref: string;
  games: Game[];
}) {
  if (games.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display font-bold text-3xl tracking-tight text-text">
          {title}
        </h2>
        <Link
          href={seeAllHref}
          className="text-nav font-semibold text-muted hover:text-text transition-colors"
        >
          See all
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {games.map((game) => (
          <GameCard key={game.id} game={game} variant="default" />
        ))}
      </div>
    </section>
  );
}

function EmptyHero() {
  return (
    <div className="rounded-3xl border border-border bg-surface min-h-80 flex items-center justify-center p-8">
      <p className="font-display font-semibold text-xl text-muted text-center">
        Nothing to feature yet — check back soon.
      </p>
    </div>
  );
}
