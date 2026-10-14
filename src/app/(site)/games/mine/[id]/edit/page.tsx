import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, serverApi } from "@/lib/api";
import GameForm from "../../../_components/game-form";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Edit · ${id}` };
}

export default async function EditMyGamePage({ params }: Props) {
  const { id } = await params;

  let game;
  try {
    game = await serverApi.getMyGame(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/games/mine"
        className="text-sm text-muted hover:text-text transition-colors inline-block mb-4"
      >
        &larr; Back to my games
      </Link>
      <h1 className="font-display font-extrabold text-3xl tracking-tight text-text mb-2">
        Edit game
      </h1>
      <p className="text-muted mb-8">
        Update your game details. Changes save as a draft unless you publish.
      </p>
      <GameForm initial={game} />
    </div>
  );
}
