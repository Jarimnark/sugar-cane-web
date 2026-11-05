import type { Metadata } from "next";
import { serverApi } from "@/lib/api";
import HeroCard from "@/components/ui/hero-card";
import GameTile from "@/components/ui/game-tile";
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

      <GameSection title="Trending" games={home.trending.slice(1)} />
      <GameSection title="Most Popular" games={home.popular} />
      <GameSection title="New this week" games={home.new} />
    </div>
  );
}

function GameSection({ title, games }: { title: string; games: Game[] }) {
  if (games.length === 0) return null;

  return (
    <section>
      <h2 className="font-display font-bold text-[28px] tracking-[-0.5px] text-text mb-4">
        {title}
      </h2>
      <div className="flex gap-5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {games.map((game) => (
          <GameTile key={game.id} game={game} />
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
