import { NextResponse } from "next/server";
import { MOCK_GAMES, MOCK_USER_LIST_SLUGS } from "@/lib/mock-data";

export async function GET() {
  const games = MOCK_GAMES.filter((g) => MOCK_USER_LIST_SLUGS.includes(g.slug));
  return NextResponse.json({ games });
}
