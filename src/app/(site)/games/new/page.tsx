import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Game",
};

export default function NewGamePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display font-extrabold text-3xl tracking-tight text-text mb-8">
        Add a game
      </h1>
      <p className="text-muted">Game creation form coming soon.</p>
    </div>
  );
}
