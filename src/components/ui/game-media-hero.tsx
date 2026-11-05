"use client";

import { useState } from "react";

type MediaItem =
  | { kind: "image"; src: string; thumb: string }
  | { kind: "youtube"; embed: string; thumb: string }
  | { kind: "drive"; embed: string };

function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?(?:.*&)?v=)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

function driveId(url: string): string | null {
  const m = url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

function buildItems(screenshots: string[], videoLinks: string[]): MediaItem[] {
  const items: MediaItem[] = [];
  for (const src of screenshots) {
    items.push({ kind: "image", src, thumb: src });
  }
  for (const url of videoLinks) {
    const yt = youtubeId(url);
    if (yt) {
      items.push({
        kind: "youtube",
        embed: `https://www.youtube.com/embed/${yt}`,
        thumb: `https://img.youtube.com/vi/${yt}/hqdefault.jpg`,
      });
      continue;
    }
    const drive = driveId(url);
    if (drive) {
      items.push({
        kind: "drive",
        embed: `https://drive.google.com/file/d/${drive}/preview`,
      });
    }
  }
  return items;
}

interface Props {
  screenshots: string[];
  videoLinks: string[];
  bg?: string;
  name: string;
}

export default function GameMediaHero({ screenshots, videoLinks, bg, name }: Props) {
  const items = buildItems(screenshots, videoLinks);
  const [activeIdx, setActiveIdx] = useState(0);

  if (items.length === 0) {
    return (
      <div
        className="relative overflow-hidden rounded-[20px] aspect-video"
        style={{ background: bg }}
      >
        <div
          aria-hidden
          className="absolute -right-15 -bottom-[90px] size-[360px] rounded-full bg-black/10 pointer-events-none"
        />
        <span className="absolute left-5 bottom-4.5 bg-white/90 rounded-full px-3.5 py-1.5 text-xs font-bold">
          {name}
        </span>
      </div>
    );
  }

  const active = items[Math.min(activeIdx, items.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative overflow-hidden rounded-[20px] aspect-video bg-black"
        style={active.kind === "drive" ? undefined : { background: bg }}
      >
        {active.kind === "image" && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={active.src}
            alt={`${name} screenshot`}
            className="size-full object-cover"
          />
        )}
        {(active.kind === "youtube" || active.kind === "drive") && (
          <iframe
            key={active.embed}
            src={active.embed}
            title={`${name} video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="size-full border-0"
          />
        )}
      </div>

      {items.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item, i) => {
            const isActive = i === activeIdx;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIdx(i)}
                aria-label={`Show media ${i + 1}`}
                aria-pressed={isActive}
                className={`relative flex-shrink-0 w-32 aspect-video rounded-lg overflow-hidden border-2 transition-colors ${
                  isActive ? "border-accent" : "border-transparent hover:border-border-strong"
                }`}
                style={{ background: bg }}
              >
                {item.kind === "image" && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={item.thumb} alt="" className="size-full object-cover" />
                )}
                {item.kind === "youtube" && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.thumb} alt="" className="size-full object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex items-center justify-center size-9 rounded-full bg-black/60 text-white">
                        ▶
                      </span>
                    </span>
                  </>
                )}
                {item.kind === "drive" && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/15">
                    <span className="flex items-center justify-center size-9 rounded-full bg-black/60 text-white">
                      ▶
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
