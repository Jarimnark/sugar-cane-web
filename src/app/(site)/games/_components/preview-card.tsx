"use client";

import type { OptionItem, PlayStyleSlug } from "@/types/api";
import { PLAY_STYLE_LABELS } from "@/lib/catalog";

interface PreviewCardProps {
  name: string;
  pitch: string;
  banner: string | null;
  genres: OptionItem[];
  playStyle: PlayStyleSlug | "";
}

export default function PreviewCard({ name, pitch, banner, genres, playStyle }: PreviewCardProps) {
  const headlineGenre = genres[0]?.name;
  const style = playStyle ? PLAY_STYLE_LABELS[playStyle] : "";
  const meta = [headlineGenre, style].filter(Boolean).join(" · ");

  return (
    <section className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-text">Preview on your game page</span>
      <article className="flex max-w-xs flex-col gap-2 rounded-2xl border border-border bg-bg p-3">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-surface">
          {banner ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={banner} alt="" className="size-full object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-xs text-muted">
              Banner shows here
            </span>
          )}
        </div>
        <h3 className="font-display font-extrabold text-lg leading-tight text-text truncate">
          {name || "Your game"}
        </h3>
        {meta && <p className="text-xs font-semibold text-muted">{meta}</p>}
        {pitch && <p className="text-sm text-text line-clamp-2">{pitch}</p>}
      </article>
    </section>
  );
}
