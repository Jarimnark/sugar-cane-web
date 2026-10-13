import { NextRequest, NextResponse } from "next/server";
import { MOCK_GAMES } from "@/lib/mock-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const game = MOCK_GAMES.find((g) => g.slug === slug);

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  return NextResponse.json(game);
}
