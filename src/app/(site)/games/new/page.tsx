import type { Metadata } from "next";
import GameForm from "../_components/game-form";

export const metadata: Metadata = {
  title: "Add Game",
};

export default function NewGamePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display font-extrabold text-3xl tracking-tight text-text mb-2">
        Add a game
      </h1>
      <p className="text-muted mb-8">
        Fill in the details, save a draft, or publish when you&apos;re ready.
      </p>
      <GameForm />
    </div>
  );
}
