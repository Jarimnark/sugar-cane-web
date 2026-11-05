"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import FormField from "@/components/ui/form-field";
import Input from "@/components/ui/input";
import RichTextEditor from "@/components/ui/rich-text-editor";
import Select from "@/components/ui/select";
import { ApiError, browserApi } from "@/lib/api";
import {
  ALLOWED_IMAGE_TYPES,
  ANDROID_URL_RE,
  FILE_DOWNLOAD_EXT_RE,
  IOS_URL_RE,
  MAX_DESCRIPTION_CHARS,
  MAX_GENRES,
  MAX_NAME_CHARS,
  MAX_PITCH_CHARS,
  MAX_SCREENSHOTS,
  MAX_SCREENSHOT_BYTES,
  MAX_TAGS,
  MAX_VIDEO_LINKS,
  MIN_DESCRIPTION_CHARS,
  MIN_GENRES,
  MIN_PLATFORMS,
  PLAYERS_OPTIONS,
  VIDEO_URL_RE,
} from "@/lib/catalog";
import type { CreateGamePayload, Game, MasterOption, PlayStyleSlug } from "@/types/api";
import BannerUpload from "./banner-upload";
import ErrorSummary from "./error-summary";
import PlayStyleRadios from "./play-style-radios";
import PreviewCard from "./preview-card";
import SuccessOverlay from "./success-overlay";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isValidHttpsUrl(value: string): boolean {
  if (!value.startsWith("https://")) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

interface GameFormProps {
  initial?: Game;
}

interface DoneState {
  title: string;
  text: string;
  href: string;
  ctaLabel: string;
}

export default function GameForm({ initial }: GameFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugLocked] = useState(isEdit);
  const [linkWeb, setLinkWeb] = useState(initial?.link_web ?? "");
  const [linkAndroid, setLinkAndroid] = useState(initial?.link_android ?? "");
  const [linkIos, setLinkIos] = useState(initial?.link_ios ?? "");
  const [pitch, setPitch] = useState(initial?.pitch ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [players, setPlayers] = useState(initial?.players ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [banner, setBanner] = useState<string | null>(initial?.banner ?? null);
  const [playStyle, setPlayStyle] = useState<PlayStyleSlug | "">(initial?.play_style ?? "");
  const [genreIds, setGenreIds] = useState<string[]>(initial?.genres?.map((g) => g.id) ?? []);
  const [platformIds, setPlatformIds] = useState<string[]>(
    initial?.platforms?.map((p) => p.id) ?? [],
  );
  const [videoLinks, setVideoLinks] = useState<string[]>(initial?.video_links ?? []);
  const [screenshots, setScreenshots] = useState<string[]>(initial?.screenshots ?? []);
  const [uploadingShot, setUploadingShot] = useState(false);
  const [shotError, setShotError] = useState<string | null>(null);

  const [masterOptions, setMasterOptions] = useState<MasterOption | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"draft" | "publish" | null>(null);
  const [done, setDone] = useState<DoneState | null>(null);

  useEffect(() => {
    browserApi.getMasterOptions().then(setMasterOptions).catch(() => {});
  }, []);

  function onNameChange(value: string) {
    setName(value);
    if (!slugLocked) setSlug(slugify(value));
  }

  async function onShotPick(files: FileList | null) {
    if (!files || files.length === 0) return;
    setShotError(null);
    const slots = MAX_SCREENSHOTS - screenshots.length;
    const picked = Array.from(files).slice(0, slots);
    setUploadingShot(true);
    try {
      for (const file of picked) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
          setShotError("Only JPEG, PNG, or WebP images are allowed");
          continue;
        }
        if (file.size > MAX_SCREENSHOT_BYTES) {
          setShotError(`${file.name} is larger than 2 MB`);
          continue;
        }
        try {
          const { url } = await browserApi.uploadMedia(file, "screenshot");
          setScreenshots((prev) => [...prev, url]);
        } catch (err) {
          if (err instanceof ApiError && err.status === 401) {
            window.location.href = "/login";
            return;
          }
          setShotError(err instanceof Error ? err.message : "Upload failed");
        }
      }
    } finally {
      setUploadingShot(false);
    }
  }

  function addTag() {
    const tag = tagInput
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    if (!tag || tags.includes(tag) || tags.length >= MAX_TAGS) return;
    setTags([...tags, tag]);
    setTagInput("");
  }

  function validate(publishing: boolean): Record<string, string> {
    const next: Record<string, string> = {};

    if (!name.trim()) next.name = "Enter your game's name.";
    if (!pitch.trim()) next.pitch = "Write a one-line pitch.";
    const descText = description.replace(/<[^>]*>/g, "").trim();
    if (!descText) next.description = "Write at least 20 characters.";
    else if (descText.length < MIN_DESCRIPTION_CHARS)
      next.description = `Write at least ${MIN_DESCRIPTION_CHARS} characters.`;
    if (!players) next.players = "Pick the number of players.";

    if (genreIds.length < MIN_GENRES) next.genres = "Pick at least one genre.";
    else if (genreIds.length > MAX_GENRES) next.genres = `Pick up to ${MAX_GENRES} genres.`;
    if (platformIds.length < MIN_PLATFORMS) next.platforms = "Pick at least one platform.";
    if (!playStyle) next.play_style = "Pick a play style.";

    const hasAnyLink = Boolean(linkWeb.trim() || linkAndroid.trim() || linkIos.trim());
    if (!hasAnyLink) {
      next.links = "Add at least one link: website, Google Play or App Store.";
    }

    if (linkWeb.trim()) {
      if (!isValidHttpsUrl(linkWeb)) {
        next.link_web = "Must be a valid https:// URL.";
      } else {
        const url = new URL(linkWeb);
        if (FILE_DOWNLOAD_EXT_RE.test(url.pathname)) {
          next.link_web = "Must open a page, not a file download.";
        }
      }
    }
    if (linkAndroid.trim() && !ANDROID_URL_RE.test(linkAndroid.trim())) {
      next.link_android = "Must be a play.google.com/store/apps/details?id= URL.";
    }
    if (linkIos.trim() && !IOS_URL_RE.test(linkIos.trim())) {
      next.link_ios = "Must be an apps.apple.com/app/... URL.";
    }

    videoLinks.forEach((url, i) => {
      if (url.trim() && !VIDEO_URL_RE.test(url)) {
        next[`video_${i}`] = "Use a YouTube or Google Drive link.";
      }
    });

    if (publishing && !banner) next.banner = "Add a banner image before publishing.";

    return next;
  }

  async function submit(publish: boolean) {
    if (busy) return;
    const next = validate(publish);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setBusy(publish ? "publish" : "draft");
    setSubmitError(null);

    const filledVideos = videoLinks.filter(Boolean);

    const payload: CreateGamePayload = {
      slug: slug || slugify(name),
      name: name.trim(),
      pitch: pitch.trim(),
      description: description.trim(),
      players,
      link_web: linkWeb.trim() || undefined,
      link_android: linkAndroid.trim() || undefined,
      link_ios: linkIos.trim() || undefined,
      tags,
      banner: banner ?? undefined,
      play_style: playStyle || undefined,
      genre_ids: genreIds.length > 0 ? genreIds : undefined,
      platform_ids: platformIds.length > 0 ? platformIds : undefined,
      video_links: filledVideos.length > 0 ? filledVideos : undefined,
      screenshots: screenshots.length > 0 ? screenshots : undefined,
    };
    if (initial?.id) payload.id = initial.id;

    try {
      const saved = await browserApi.saveMyGame(payload, publish);
      if (publish) {
        setDone({
          title: `${saved.name} is live`,
          text: "Players can now find and play your game on Hopbu.",
          href: `/games/${saved.id}`,
          ctaLabel: "View game page",
        });
      } else {
        setDone({
          title: "Draft saved",
          text: "Keep editing from your games list, or publish when ready.",
          href: `/games/mine/${saved.id}/edit`,
          ctaLabel: "Back to editor",
        });
      }
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

  function resetForm() {
    setDone(null);
    setName("");
    setSlug("");
    setLinkWeb("");
    setLinkAndroid("");
    setLinkIos("");
    setPitch("");
    setDescription("");
    setPlayers("");
    setTags([]);
    setTagInput("");
    setBanner(null);
    setPlayStyle("");
    setGenreIds([]);
    setPlatformIds([]);
    setVideoLinks([]);
    setScreenshots([]);
    setErrors({});
    setSubmitError(null);
  }

  const isPublished = initial?.status === "published";

  if (done) {
    return (
      <SuccessOverlay
        title={done.title}
        text={done.text}
        href={done.href}
        ctaLabel={done.ctaLabel}
        onReset={resetForm}
      />
    );
  }

  const selectedGenres =
    masterOptions?.genres.filter((g) => genreIds.includes(g.id)) ?? [];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit(false);
      }}
      className="flex flex-col gap-8"
    >
      <ErrorSummary errors={errors} />

      {/* Basics */}
      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-bg p-6">
        <h2 className="font-display font-bold text-xl text-text">Basics</h2>

        <FormField id="name" label="Game name" error={errors.name}>
          <Input
            id="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Tidebound"
            maxLength={MAX_NAME_CHARS}
            invalid={Boolean(errors.name)}
            required
          />
        </FormField>

        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <span className="font-display font-bold text-base text-text">Where players play</span>
          <p className="text-xs text-muted">
            Each link is optional, but add at least one. Links must open a page, never start a
            file download.
          </p>

          <div className="mt-2 flex flex-col gap-1.5">
            <label htmlFor="link_web" className="text-sm font-semibold text-text">
              Website link <span className="font-normal text-muted">(optional)</span>
            </label>
            <Input
              id="link_web"
              type="url"
              value={linkWeb}
              onChange={(e) => setLinkWeb(e.target.value)}
              placeholder="https://yourgame.com/play"
              invalid={Boolean(errors.link_web)}
            />
            <p className="text-xs text-muted">
              The page where your game runs or can be played. Must start with https://.
            </p>
            {errors.link_web && <p className="text-xs text-red-700">{errors.link_web}</p>}
          </div>

          <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="link_android" className="text-sm font-semibold text-text">
                Google Play (Android) <span className="font-normal text-muted">(optional)</span>
              </label>
              <Input
                id="link_android"
                type="url"
                value={linkAndroid}
                onChange={(e) => setLinkAndroid(e.target.value)}
                placeholder="https://play.google.com/store/apps/details?id=..."
                invalid={Boolean(errors.link_android)}
              />
              {errors.link_android && (
                <p className="text-xs text-red-700">{errors.link_android}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="link_ios" className="text-sm font-semibold text-text">
                App Store (iOS) <span className="font-normal text-muted">(optional)</span>
              </label>
              <Input
                id="link_ios"
                type="url"
                value={linkIos}
                onChange={(e) => setLinkIos(e.target.value)}
                placeholder="https://apps.apple.com/app/..."
                invalid={Boolean(errors.link_ios)}
              />
              {errors.link_ios && <p className="text-xs text-red-700">{errors.link_ios}</p>}
            </div>
          </div>

          {errors.links && <p className="text-xs text-red-700">{errors.links}</p>}
        </div>
      </section>

      {/* Media */}
      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-bg p-6">
        <h2 className="font-display font-bold text-xl text-text">Media</h2>

        <BannerUpload
          value={banner}
          onChange={setBanner}
          invalid={Boolean(errors.banner)}
          error={errors.banner}
        />

        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <span className="text-sm font-semibold text-text">
            Screenshots <span className="font-normal text-muted">(optional, up to {MAX_SCREENSHOTS})</span>
          </span>

          {screenshots.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {screenshots.map((url, i) => (
                <div
                  key={url}
                  className="relative aspect-video overflow-hidden rounded-lg border border-border bg-surface"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Screenshot ${i + 1}`}
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setScreenshots(screenshots.filter((_, j) => j !== i))}
                    aria-label={`Remove screenshot ${i + 1}`}
                    className="absolute right-1.5 top-1.5 size-7 rounded-full bg-black/60 text-lg leading-none text-white hover:bg-black/80 transition-colors cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {screenshots.length < MAX_SCREENSHOTS && (
            <label
              className={`inline-flex items-center gap-2 self-start rounded-lg border border-dashed border-border-strong px-4 py-2 text-sm font-semibold transition-colors ${
                uploadingShot ? "cursor-wait text-muted" : "cursor-pointer text-text hover:border-accent"
              }`}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                disabled={uploadingShot}
                onChange={(e) => {
                  void onShotPick(e.target.files);
                  e.target.value = "";
                }}
              />
              {uploadingShot ? "Uploading..." : "+ Add screenshots"}
            </label>
          )}

          {shotError && <p className="text-xs text-red-700">{shotError}</p>}
          <p className="text-xs text-muted">JPEG, PNG, or WebP. Max 2 MB each.</p>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <span className="text-sm font-semibold text-text">
            Trailer video links <span className="font-normal text-muted">(optional, up to {MAX_VIDEO_LINKS})</span>
          </span>
          <p className="text-xs text-muted">
            Paste YouTube or Google Drive links. Drive files must be shared as &quot;Anyone with
            the link&quot;.
          </p>
          {videoLinks.map((url, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex flex-1 flex-col gap-1.5">
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    const next = [...videoLinks];
                    next[i] = e.target.value;
                    setVideoLinks(next);
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  invalid={Boolean(errors[`video_${i}`])}
                />
                {errors[`video_${i}`] && (
                  <p className="text-xs text-red-700">{errors[`video_${i}`]}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setVideoLinks(videoLinks.filter((_, j) => j !== i))}
                className="flex h-11 items-center px-3 text-lg text-muted hover:text-text transition-colors cursor-pointer"
                aria-label="Remove video"
              >
                ×
              </button>
            </div>
          ))}
          {videoLinks.length < MAX_VIDEO_LINKS && (
            <button
              type="button"
              onClick={() => setVideoLinks([...videoLinks, ""])}
              className="self-start text-sm text-muted hover:text-text transition-colors cursor-pointer"
            >
              + Add trailer link
            </button>
          )}
        </div>
      </section>

      {/* About the game */}
      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-bg p-6">
        <h2 className="font-display font-bold text-xl text-text">About the game</h2>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="pitch" className="text-sm font-semibold text-text">
            One-line pitch
          </label>
          <Input
            id="pitch"
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder="A fast-paced roguelike with pixel-art visuals"
            maxLength={MAX_PITCH_CHARS}
            invalid={Boolean(errors.pitch)}
            required
          />
          <p className="text-xs text-muted">
            {pitch.length}/{MAX_PITCH_CHARS} · Shown on game cards as the subtitle
          </p>
          {errors.pitch && <p className="text-xs text-red-700">{errors.pitch}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-text">Description</label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="What is the game, and why will players love it?"
            maxTextLength={MAX_DESCRIPTION_CHARS}
            invalid={Boolean(errors.description)}
          />
          {errors.description && <p className="text-xs text-red-700">{errors.description}</p>}
        </div>

        {masterOptions && masterOptions.genres.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-text">Genre</span>
              <span className="text-xs text-muted">Pick 1 to {MAX_GENRES}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {masterOptions.genres.map((genre) => {
                const selected = genreIds.includes(genre.id);
                const atMax = !selected && genreIds.length >= MAX_GENRES;
                return (
                  <button
                    key={genre.id}
                    type="button"
                    disabled={atMax}
                    onClick={() =>
                      setGenreIds(
                        selected
                          ? genreIds.filter((id) => id !== genre.id)
                          : [...genreIds, genre.id],
                      )
                    }
                    className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors cursor-pointer ${
                      selected
                        ? "border-accent bg-accent text-text"
                        : atMax
                        ? "border-border bg-surface text-muted cursor-not-allowed"
                        : "border-border-strong bg-bg text-text hover:border-accent"
                    }`}
                  >
                    {genre.name}
                  </button>
                );
              })}
            </div>
            {errors.genres && <p className="text-xs text-red-700">{errors.genres}</p>}
            {genreIds.length > 0 && !errors.genres && (
              <p className="text-xs text-muted">
                {genreIds.length} of {MAX_GENRES} picked
              </p>
            )}
          </div>
        )}

        <PlayStyleRadios
          value={playStyle}
          onChange={setPlayStyle}
          error={errors.play_style}
        />

        <FormField id="players" label="Number of players" error={errors.players}>
          <Select
            id="players"
            value={players}
            onChange={(e) => setPlayers(e.target.value)}
            options={PLAYERS_OPTIONS}
            placeholder="Select player count"
            invalid={Boolean(errors.players)}
          />
        </FormField>

        {masterOptions && masterOptions.platforms.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-text">Platform</span>
            <div className="flex flex-wrap gap-4">
              {masterOptions.platforms.map((platform) => {
                const checked = platformIds.includes(platform.id);
                return (
                  <label
                    key={platform.id}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setPlatformIds(
                          checked
                            ? platformIds.filter((id) => id !== platform.id)
                            : [...platformIds, platform.id],
                        )
                      }
                      className="size-4 accent-[var(--color-accent)]"
                    />
                    <span className="text-sm text-text">{platform.name}</span>
                  </label>
                );
              })}
            </div>
            {errors.platforms && <p className="text-xs text-red-700">{errors.platforms}</p>}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-text">
            Extra tags <span className="font-normal text-muted">(optional, up to {MAX_TAGS})</span>
          </label>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                    className="leading-none text-muted hover:text-text transition-colors cursor-pointer"
                    aria-label={`Remove tag ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder={
              tags.length >= MAX_TAGS
                ? `Max ${MAX_TAGS} tags reached`
                : "e.g. pixel-art · press Enter to add"
            }
            disabled={tags.length >= MAX_TAGS}
          />
        </div>
      </section>

      <PreviewCard
        name={name}
        pitch={pitch}
        banner={banner}
        genres={selectedGenres}
        playStyle={playStyle}
      />

      {submitError && (
        <p className="text-sm text-red-700" role="alert">
          {submitError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/games/mine")}
          disabled={busy !== null}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void submit(false)}
          disabled={busy !== null}
        >
          {busy === "draft" ? "Saving..." : "Save as draft"}
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
