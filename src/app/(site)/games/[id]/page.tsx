import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import { ApiError, serverApi } from "@/lib/api";
import type { CommentListResponse, Game } from "@/types/api";
import GameMediaHero from "@/components/ui/game-media-hero";
import Comments from "./_components/comments";
import GameActions from "./_components/game-actions";
import OwnerBanner from "./_components/owner-banner";

const ALLOWED_TAGS = ["h2", "p", "ul", "ol", "li", "strong", "u", "br"] as const;

function renderDescription(raw: string): { html: string } | { text: string } {
  if (raw.trimStart().startsWith("<")) {
    return {
      html: sanitizeHtml(raw, {
        allowedTags: [...ALLOWED_TAGS],
        allowedAttributes: {},
      }),
    };
  }
  // Legacy plain text or old JSON block format
  try {
    const parsed = JSON.parse(raw) as { blocks?: Array<{ children?: Array<{ text?: string }> }> };
    if (parsed?.blocks) {
      return {
        text: parsed.blocks
          .map((b) => (b.children ?? []).map((c) => c.text ?? "").join(""))
          .filter(Boolean)
          .join("\n\n"),
      };
    }
  } catch { /* fall through */ }
  return { text: raw };
}

interface Props {
  params: Promise<{ id: string }>;
}

async function loadGame(id: string): Promise<Game> {
  try {
    return await serverApi.getGame(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

async function loadRelated(id: string): Promise<Game[]> {
  try {
    return await serverApi.getRelatedGames(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

async function loadComments(id: string): Promise<CommentListResponse> {
  try {
    return await serverApi.getGameComments(id, { sort: "newest", page: 1, limit: 20 });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return { count: 0, items: [] };
    throw err;
  }
}


function platformLabel(game: Game): string {
  const parts: string[] = [];
  if (game.link_web) parts.push("Web");
  if (game.link_android) parts.push("Android");
  if (game.link_ios) parts.push("iOS");
  return parts.join(", ") || "—";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function mono(name: string): string {
  return name.slice(0, 3).toUpperCase();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const game = await serverApi.getGame(id);
    return { title: game.name, description: game.pitch };
  } catch {
    return { title: id };
  }
}

export default async function GamePage({ params }: Props) {
  const { id } = await params;
  const [game, related, comments] = await Promise.all([
    loadGame(id),
    loadRelated(id),
    loadComments(id),
  ]);

  const relatedItems = related.filter((g) => g.id !== game.id);
  const genre = game.tags[0] ?? null;
  const description = renderDescription(game.description);

  return (
    <>
      <OwnerBanner ownerId={game.owner_id} gameId={game.id} status={game.status} />

      <div className="max-w-340 mx-auto px-4 sm:px-6 lg:px-10 py-6 flex flex-col gap-12">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm text-muted flex items-center gap-1.5">
          <Link href="/" className="hover:text-text transition-colors">Home</Link>
          {genre && (
            <>
              <span>/</span>
              <Link href={`/browse?genre=${encodeURIComponent(genre)}`} className="hover:text-text transition-colors capitalize">
                {genre}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="font-semibold text-text">{game.name}</span>
        </nav>

        {/* Main two-column layout */}
        <div className="flex flex-wrap gap-8 items-start">

          {/* Media block */}
          <section
            aria-label="Media"
            className="flex flex-col gap-3 min-w-0"
            style={{ flex: "999 1 560px" }}
          >
            <GameMediaHero
              screenshots={game.screenshots ?? []}
              videoLinks={game.video_links ?? []}
              bg={game.bg}
              name={game.name}
            />
          </section>

          {/* Info aside */}
          <aside
            aria-label="Game info"
            className="flex flex-col gap-4 min-w-0"
            style={{ flex: "1 1 360px", maxWidth: "460px" }}
          >
            <h1 className="font-display font-extrabold leading-none tracking-[-1.5px] text-text" style={{ fontSize: "clamp(34px, 4vw, 52px)" }}>
              {game.name}
            </h1>

            <p className="text-[15px] text-muted">
              by <span className="font-bold text-text">{game.dev}</span>
            </p>

            {/* Chips */}
            <div className="flex flex-wrap gap-2 text-sm font-semibold">
              {game.tags.map((t) => (
                <Link
                  key={t}
                  href={`/browse?genre=${encodeURIComponent(t)}`}
                  className="px-3 py-1.5 rounded-full no-underline text-text capitalize"
                  style={{ background: "#DCEBFA" }}
                >
                  {t}
                </Link>
              ))}
              {game.players && (
                <span className="bg-surface px-3 py-1.5 rounded-full text-text">
                  {game.players}
                </span>
              )}
            </div>

            {/* Actions */}
            <GameActions game={game} />

            {/* Details grid */}
            <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 text-[15px] border-t border-border pt-4">
              {genre && (
                <>
                  <dt className="text-muted">Genre</dt>
                  <dd className="font-semibold capitalize">{genre}</dd>
                </>
              )}
              {game.players && (
                <>
                  <dt className="text-muted">Players</dt>
                  <dd className="font-semibold">{game.players}</dd>
                </>
              )}
              <dt className="text-muted">Platform</dt>
              <dd className="font-semibold">{platformLabel(game)}</dd>
              <dt className="text-muted">Developer</dt>
              <dd className="font-semibold">{game.dev}</dd>
              <dt className="text-muted">Added</dt>
              <dd className="font-semibold">{formatDate(game.created_at)}</dd>
            </dl>
          </aside>
        </div>

        {/* About section */}
        <section aria-labelledby="about-heading" className="flex flex-col gap-3 max-w-[68ch]">
          <h2 id="about-heading" className="font-display font-bold text-[26px] text-text">
            About {game.name}
          </h2>
          {"html" in description ? (
            <div
              className="prose-rte text-[17px] text-[#2C342B]"
              dangerouslySetInnerHTML={{ __html: description.html }}
            />
          ) : (
            <p className="text-[17px] leading-[1.65] text-[#2C342B] whitespace-pre-wrap">
              {description.text}
            </p>
          )}
          {game.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {game.tags.map((t) => (
                <span
                  key={t}
                  className="text-sm font-semibold px-3 py-1.5 rounded-full capitalize"
                  style={{ background: "#DCEFE3", color: "#14541F" }}
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Comments */}
        <Comments gameId={game.id} gameName={game.name} initial={comments} />

        {/* More games */}
        {relatedItems.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between gap-4 mb-4">
              <h2 className="font-display font-bold text-[26px] text-text">
                {genre ? `More ${genre} games` : "You might also like"}
              </h2>
              <Link
                href={genre ? `/browse?genre=${encodeURIComponent(genre)}` : "/browse"}
                className="font-semibold text-[15px] text-muted hover:text-text transition-colors"
              >
                See all
              </Link>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
              {relatedItems.map((g) => (
                <Link
                  key={g.id}
                  href={`/games/${g.id}`}
                  className="group flex flex-col gap-2 text-text no-underline transition-transform duration-150 hover:-translate-y-0.5"
                >
                  <span
                    className="relative overflow-hidden block rounded-[14px] aspect-[16/10]"
                    style={{ background: g.bg }}
                  >
                    <span
                      aria-hidden
                      className="absolute -right-7.5 -bottom-[50px] size-[150px] rounded-full bg-black/10 pointer-events-none"
                    />
                    <span
                      aria-hidden
                      className="absolute left-4 bottom-3 font-display font-extrabold text-[30px] opacity-80 text-text"
                    >
                      {mono(g.name)}
                    </span>
                  </span>
                  <span className="font-bold text-base">{g.name}</span>
                  {(g.dev || g.tags[0]) && (
                    <span className="text-sm text-muted -mt-1.5">
                      {[g.tags[0], g.dev ? `by ${g.dev}` : null].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
