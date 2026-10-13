import { NextRequest, NextResponse } from "next/server";
import { MOCK_GAMES } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.toLowerCase();
  const genre = searchParams.get("genre");
  const platform = searchParams.get("platform");
  const sort = searchParams.get("sort") ?? "popular";
  const offset = Number(searchParams.get("offset") ?? 0);
  const limit = Number(searchParams.get("limit") ?? 20);

  let games = [...MOCK_GAMES];

  if (q) {
    games = games.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.pitch.toLowerCase().includes(q) ||
        g.tags.some((t) => t.includes(q)),
    );
  }
  if (genre) {
    games = games.filter((g) =>
      g.genre.map((x) => x.toLowerCase()).includes(genre.toLowerCase()),
    );
  }
  if (platform) {
    games = games.filter((g) =>
      g.platforms.map((x) => x.toLowerCase()).includes(platform.toLowerCase()),
    );
  }

  if (sort === "popular") games.sort((a, b) => b.likeCount - a.likeCount);
  else if (sort === "az") games.sort((a, b) => a.name.localeCompare(b.name));

  const page = games.slice(offset, offset + limit);

  return NextResponse.json({ games: page, total: games.length });
}
