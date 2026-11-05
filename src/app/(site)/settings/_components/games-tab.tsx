import Link from "next/link";
import type { MyGame } from "@/types/api";

interface GamesTabProps {
  games: MyGame[];
}

export default function GamesTab({ games }: GamesTabProps) {
  const sorted = [...games].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <section className="rounded-2xl border border-border bg-bg p-6 sm:p-8">
      <header className="mb-6 flex items-center justify-between gap-3">
        <h2 className="font-display font-bold text-xl text-text">My games</h2>
        <Link
          href="/games/new"
          className="inline-flex items-center justify-center gap-2 h-9 px-4 text-sm rounded-full bg-accent text-text font-semibold hover:opacity-90 transition-opacity"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add new game
        </Link>
      </header>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-10 text-center">
          <p className="text-text font-semibold mb-2">You haven&apos;t listed any games yet.</p>
          <Link
            href="/games/new"
            className="inline-flex mt-4 items-center justify-center h-11 px-5 text-nav rounded-full bg-accent text-text font-semibold hover:opacity-90 transition-opacity"
          >
            Add your first game
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {sorted.map((game) => (
            <GameRow key={game.id} game={game} />
          ))}
        </ul>
      )}
    </section>
  );
}

function GameRow({ game }: { game: MyGame }) {
  const isPublished = game.status === "published";
  const created = new Date(game.created_at);
  const createdLabel = Number.isNaN(created.getTime())
    ? game.created_at
    : `Created ${created.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}`;

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center">
      <div
        className="size-14 shrink-0 rounded-lg"
        style={{ backgroundColor: game.bg }}
        aria-hidden
      />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-text truncate">{game.name}</h3>
          <StatusBadge published={isPublished} />
        </div>
        <p className="text-xs text-muted mt-1">{createdLabel}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/games/mine/${game.id}/edit`}
          className="inline-flex items-center justify-center h-9 px-4 text-sm rounded-full bg-bg text-text border border-border-strong hover:bg-surface font-semibold transition-colors"
        >
          Edit
        </Link>
        <Link
          href={`/games/${game.id}`}
          className="inline-flex items-center justify-center h-9 px-4 text-sm rounded-full bg-transparent text-text hover:bg-bg font-semibold transition-colors"
        >
          View page
        </Link>
      </div>
    </li>
  );
}

function StatusBadge({ published }: { published: boolean }) {
  if (published) {
    return (
      <span
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
        style={{ background: "#DCEFE3", color: "#14541F" }}
      >
        Published
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-bg px-2.5 py-0.5 text-xs font-semibold text-muted border border-border">
      Draft
    </span>
  );
}
