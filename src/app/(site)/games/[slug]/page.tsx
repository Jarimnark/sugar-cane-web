import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug };
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params;

  // TODO: fetch game data from API
  if (!slug) notFound();

  return (
    <div className="max-w-340 mx-auto px-4 sm:px-6 lg:px-10 py-10">
      <h1 className="font-display font-extrabold text-3xl tracking-tight text-text mb-4">
        {slug}
      </h1>
      <p className="text-muted">Game detail coming soon.</p>
    </div>
  );
}
