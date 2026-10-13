"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/button";
import FormField from "@/components/ui/form-field";
import Input from "@/components/ui/input";
import { ApiError, browserApi } from "@/lib/api";
import type { CreateGamePayload, Game } from "@/types/api";

interface GameFormProps {
  initial?: Game;
}

const bgSwatches = [
  "#f1ecff",
  "#e3daff",
  "#d6c9fb",
  "#c9b8f5",
  "#ffe4ec",
  "#ffd1a8",
  "#fff3b0",
  "#d6f3c9",
  "#c6ead6",
  "#bde7f2",
  "#c7d8ff",
  "#e6eae2",
];

const defaultBg = bgSwatches[0];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function GameForm({ initial }: GameFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [dev, setDev] = useState(initial?.dev ?? "");
  const [linkWeb, setLinkWeb] = useState(initial?.link_web ?? "");
  const [linkAndroid, setLinkAndroid] = useState(initial?.link_android ?? "");
  const [linkIos, setLinkIos] = useState(initial?.link_ios ?? "");
  const [pitch, setPitch] = useState(initial?.pitch ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [players, setPlayers] = useState(initial?.players ?? "");
  const [tagsInput, setTagsInput] = useState((initial?.tags ?? []).join(", "));
  const [bg, setBg] = useState(initial?.bg ?? defaultBg);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"draft" | "publish" | null>(null);

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function onSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(value);
  }

  function parseTags(raw: string): string[] {
    return raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required";
    const slugValue = slug.trim();
    if (!slugValue) {
      next.slug = "Slug is required";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slugValue)) {
      next.slug = "Use lowercase letters, numbers, and hyphens";
    }
    if (!dev.trim()) next.dev = "Developer is required";
    if (!pitch.trim()) next.pitch = "Pitch is required";
    if (!description.trim()) next.description = "Description is required";
    if (!players.trim()) next.players = "Players is required";
    if (!linkWeb.trim()) {
      next.link_web = "Web link is required";
    } else {
      try {
        new URL(linkWeb);
      } catch {
        next.link_web = "Enter a valid URL (including https://)";
      }
    }
    for (const [key, value] of [
      ["link_android", linkAndroid],
      ["link_ios", linkIos],
    ] as const) {
      if (value.trim()) {
        try {
          new URL(value);
        } catch {
          next[key] = "Enter a valid URL (including https://)";
        }
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(publish: boolean) {
    if (busy) return;
    if (!validate()) return;
    setBusy(publish ? "publish" : "draft");
    setSubmitError(null);

    const payload: CreateGamePayload = {
      slug: slug.trim(),
      name: name.trim(),
      dev: dev.trim(),
      pitch: pitch.trim(),
      description: description.trim(),
      bg,
      players: players.trim(),
      link_web: linkWeb.trim(),
      link_android: linkAndroid.trim() || undefined,
      link_ios: linkIos.trim() || undefined,
      tags: parseTags(tagsInput),
    };
    if (initial?.id) payload.id = initial.id;

    try {
      const saved = await browserApi.saveMyGame(payload, publish);
      router.push(`/games/mine/${saved.slug}/edit`);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = "/login";
        return;
      }
      setSubmitError(err instanceof Error ? err.message : "Could not save game");
    } finally {
      setBusy(null);
    }
  }

  const isPublished = initial?.status === "published";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit(false);
      }}
      className="flex flex-col gap-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormField id="name" label="Game name" error={errors.name}>
          <Input
            id="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Super Platformer"
            invalid={Boolean(errors.name)}
            required
          />
        </FormField>

        <FormField id="slug" label="Slug" error={errors.slug}>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="super-platformer"
            invalid={Boolean(errors.slug)}
            required
          />
        </FormField>
      </div>

      <FormField id="dev" label="Developer" error={errors.dev}>
        <Input
          id="dev"
          value={dev}
          onChange={(e) => setDev(e.target.value)}
          placeholder="Studio or author name"
          invalid={Boolean(errors.dev)}
          required
        />
      </FormField>

      <FormField id="link_web" label="Web play link" error={errors.link_web}>
        <Input
          id="link_web"
          type="url"
          value={linkWeb}
          onChange={(e) => setLinkWeb(e.target.value)}
          placeholder="https://example.com/play"
          invalid={Boolean(errors.link_web)}
          required
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormField id="link_android" label="Android link (optional)" error={errors.link_android}>
          <Input
            id="link_android"
            type="url"
            value={linkAndroid}
            onChange={(e) => setLinkAndroid(e.target.value)}
            placeholder="https://play.google.com/..."
            invalid={Boolean(errors.link_android)}
          />
        </FormField>

        <FormField id="link_ios" label="iOS link (optional)" error={errors.link_ios}>
          <Input
            id="link_ios"
            type="url"
            value={linkIos}
            onChange={(e) => setLinkIos(e.target.value)}
            placeholder="https://apps.apple.com/..."
            invalid={Boolean(errors.link_ios)}
          />
        </FormField>
      </div>

      <FormField id="pitch" label="One-line pitch" error={errors.pitch}>
        <Input
          id="pitch"
          value={pitch}
          onChange={(e) => setPitch(e.target.value)}
          placeholder="A fast-paced retro platformer"
          maxLength={160}
          invalid={Boolean(errors.pitch)}
          required
        />
      </FormField>

      <FormField id="description" label="Description" error={errors.description}>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell players what makes your game special..."
          rows={6}
          aria-invalid={Boolean(errors.description) || undefined}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none transition-colors placeholder:text-muted focus:border-accent"
        />
      </FormField>

      <FormField id="players" label="Players" error={errors.players}>
        <Input
          id="players"
          value={players}
          onChange={(e) => setPlayers(e.target.value)}
          placeholder="e.g. 1-4 players"
          invalid={Boolean(errors.players)}
          required
        />
      </FormField>

      <FormField id="tags" label="Tags (comma-separated)">
        <Input
          id="tags"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="roguelike, pixel-art, co-op"
        />
      </FormField>

      <FormField id="bg" label="Cover color">
        <div className="flex flex-wrap gap-2">
          {bgSwatches.map((swatch) => {
            const active = bg.toLowerCase() === swatch.toLowerCase();
            return (
              <button
                key={swatch}
                type="button"
                aria-label={`Pick color ${swatch}`}
                aria-pressed={active}
                onClick={() => setBg(swatch)}
                className={`size-10 rounded-full border-2 transition-transform cursor-pointer ${
                  active ? "border-accent scale-110" : "border-border hover:scale-105"
                }`}
                style={{ backgroundColor: swatch }}
              />
            );
          })}
        </div>
      </FormField>

      {submitError && (
        <p className="text-sm text-red-700" role="alert">
          {submitError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
        <Button
          type="button"
          variant="secondary"
          onClick={() => void submit(false)}
          disabled={busy !== null}
        >
          {busy === "draft" ? "Saving..." : "Save draft"}
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={() => void submit(true)}
          disabled={busy !== null}
        >
          {busy === "publish" ? "Publishing..." : isPublished ? "Update" : "Publish"}
        </Button>
      </div>
    </form>
  );
}
