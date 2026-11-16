"use client";

import { useRef, useState } from "react";
import { ApiError, browserApi } from "@/lib/api";
import {
  ALLOWED_IMAGE_TYPES,
  BANNER_ASPECT_RATIO,
  MAX_BANNER_BYTES,
} from "@/lib/catalog";

const TARGET_WIDTH = 1600;
const TARGET_HEIGHT = 900;
const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const CROP_TOLERANCE = 0.02;

interface BannerUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  invalid?: boolean;
  error?: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("could not read image"));
    img.src = src;
  });
}

interface Processed {
  blob: Blob;
  wasModified: boolean;
  width: number;
  height: number;
}

async function cropAndResize(file: File): Promise<Processed> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const srcRatio = img.width / img.height;
    const dstRatio = BANNER_ASPECT_RATIO;

    // Center-cover crop so the source fully fills a 1600x900 canvas.
    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    if (srcRatio > dstRatio) {
      sw = img.height * dstRatio;
      sx = (img.width - sw) / 2;
    } else if (srcRatio < dstRatio) {
      sh = img.width / dstRatio;
      sy = (img.height - sh) / 2;
    }

    const canvas = document.createElement("canvas");
    canvas.width = TARGET_WIDTH;
    canvas.height = TARGET_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d context unavailable");
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);

    const outType =
      file.type === "image/png" || file.type === "image/webp"
        ? file.type
        : "image/jpeg";
    const quality = outType === "image/png" ? undefined : 0.9;

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob returned null"))),
        outType,
        quality,
      );
    });

    const ratioOff =
      Math.abs(srcRatio - dstRatio) > CROP_TOLERANCE * dstRatio;
    const sizeOff = img.width !== TARGET_WIDTH || img.height !== TARGET_HEIGHT;
    return {
      blob,
      wasModified: ratioOff || sizeOff,
      width: img.width,
      height: img.height,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function BannerUpload({ value, onChange, invalid, error }: BannerUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [cropNote, setCropNote] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onPick(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    setLocalError(null);
    setCropNote(null);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      setLocalError("Use JPEG, PNG or WebP.");
      return;
    }
    if (file.size > MAX_SOURCE_BYTES) {
      setLocalError("Source image must be 10 MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const { blob, wasModified, width, height } = await cropAndResize(file);
      if (blob.size > MAX_BANNER_BYTES) {
        setLocalError(
          "We couldn't compress your banner under 2 MB. Try a smaller source image.",
        );
        return;
      }
      const ext =
        blob.type === "image/png"
          ? "png"
          : blob.type === "image/webp"
            ? "webp"
            : "jpg";
      const processed = new File([blob], `banner.${ext}`, { type: blob.type });

      const { url } = await browserApi.uploadMedia(processed, "banner");
      onChange(url);
      if (wasModified) {
        setCropNote(
          `We cropped your image (${width}×${height}) to 1600×900 (16:9) for a consistent banner. The focus stays centered.`,
        );
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = "/login";
        return;
      }
      setLocalError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const shownError = localError ?? error;
  const borderClass = invalid || localError ? "border-red-700" : "border-border-strong";

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-text">
        Banner image <span className="font-normal text-muted">(required to publish)</span>
      </label>
      <p className="text-xs text-muted">
        Any size, JPG/PNG/WebP up to 10 MB. We auto-crop to 16:9 (1600×900) and compress
        under 2 MB.
      </p>

      {value ? (
        <div className="relative aspect-video w-full max-w-xl overflow-hidden rounded-xl border border-border bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Banner preview" className="size-full object-cover" />
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setCropNote(null);
            }}
            aria-label="Remove banner"
            className="absolute right-2 top-2 size-8 rounded-full bg-black/60 text-white text-xl leading-none hover:bg-black/80 transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>
      ) : (
        <label
          className={`flex aspect-video w-full max-w-xl cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed ${borderClass} bg-surface text-sm font-semibold text-text transition-colors hover:border-accent ${uploading ? "cursor-wait text-muted" : ""}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              void onPick(e.target.files);
              e.target.value = "";
            }}
          />
          <span className="text-2xl leading-none">+</span>
          <span>{uploading ? "Processing..." : "Upload a banner"}</span>
          <span className="text-xs font-normal text-muted">
            JPG / PNG / WebP · we&apos;ll crop &amp; resize to 1600×900
          </span>
        </label>
      )}

      {cropNote && !localError && (
        <p className="text-xs text-muted">{cropNote}</p>
      )}
      {shownError && <p className="text-xs text-red-700">{shownError}</p>}
    </div>
  );
}
