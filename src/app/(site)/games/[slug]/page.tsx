import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GameCard from "@/components/ui/game-card";
import { ApiError, serverApi } from "@/lib/api";
import type { Game } from "@/types/api";
import GameActions from "./_components/game-actions";

interface Props {
  params: Promise<{ slug: string }>;
}

async function loadGame(slug: string): Promise<Game> {
  try {
    return await serverApi.getGame(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

async function loadRelated(slug: string): Promise<Game[]> {
  try {
    return await serverApi.getRelatedGames(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const game = await serverApi.getGame(slug);
    return {
      title: game.name,
      description: game.pitch,
    };
  } catch {
    return { title: slug };
  }
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  const [game, related] = await Promise.all([loadGame(slug), loadRelated(slug)]);
  const relatedItems = related.filter((g) => g.id !== game.id);

  return (
    <div className="max-w-340 mx-auto px-4 sm:px-6 lg:px-10 py-10 flex flex-col gap-12">
      <section
        className="relative rounded-3xl overflow-hidden min-h-110 flex flex-col justify-end p-8 sm:p-12"
        style={{ backgroundColor: game.bg }}
      >
        <div className="relative flex flex-col gap-5 max-w-2xl">
          {game.badge && (
            <span className="inline-flex items-center self-start bg-accent text-text text-xs font-bold uppercase tracking-widest rounded-full px-3.5 py-1.5">
              {game.badge}
            </span>
          )}

          <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl leading-none tracking-[-0.03em] text-text">
            {game.name}
          </h1>

          <p className="text-nav font-semibold text-muted">
            by <span className="text-text">{game.dev}</span>
          </p>

          <div className="flex flex-wrap gap-2">
            {game.tags.map((t) => (
              <span
                key={t}
                className="bg-bg text-text text-sm font-bold rounded-full px-3.5 py-1"
              >
                {t}
              </span>
            ))}
          </div>

          <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted">
            {game.players && (
              <div className="flex gap-2">
                <dt className="font-semibold text-text">Players:</dt>
                <dd>{game.players}</dd>
              </div>
            )}
          </dl>

          <div className="mt-1">
            <GameActions game={game} />
          </div>
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div>
            <h2 className="font-display font-bold text-2xl tracking-tight text-text mb-2">
              Pitch
            </h2>
            <p className="text-lg leading-snug text-text">{game.pitch}</p>
          </div>

          <div>
            <h2 className="font-display font-bold text-2xl tracking-tight text-text mb-2">
              About
            </h2>
            <p className="text-base leading-relaxed text-muted whitespace-pre-wrap">
              {game.description}
            </p>
          </div>

          {game.tags.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-lg tracking-tight text-text mb-2">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {game.tags.map((t) => (
                  <span
                    key={t}
                    className="bg-surface text-muted text-xs font-semibold rounded-full px-2.5 py-0.5"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 h-fit">
          <h3 className="font-display font-bold text-lg tracking-tight text-text">
            Details
          </h3>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Developer</dt>
              <dd className="font-semibold text-text text-right">{game.dev}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Likes</dt>
              <dd className="font-semibold text-text text-right">
                {game.like_count.toLocaleString()}
              </dd>
            </div>
            {game.players && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Players</dt>
                <dd className="font-semibold text-text text-right">{game.players}</dd>
              </div>
            )}
          </dl>
        </aside>
      </section>

      {relatedItems.length > 0 && (
        <section>
          <h2 className="font-display font-bold text-3xl tracking-tight text-text mb-5">
            You might also like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {relatedItems.map((g) => (
              <GameCard key={g.id} game={g} variant="compact" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
