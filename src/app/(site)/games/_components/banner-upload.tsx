"use client";

import { useRef, useState } from "react";
import { ApiError, browserApi } from "@/lib/api";
import {
  ALLOWED_IMAGE_TYPES,
  BANNER_ASPECT_RATIO,
  BANNER_ASPECT_TOLERANCE,
  MAX_BANNER_BYTES,
} from "@/lib/catalog";

interface BannerUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  invalid?: boolean;
  error?: string;
}

async function checkAspectRatio(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      URL.revokeObjectURL(url);
      resolve(Math.abs(ratio - BANNER_ASPECT_RATIO) <= BANNER_ASPECT_TOLERANCE * BANNER_ASPECT_RATIO);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    img.src = url;
  });
}

export default function BannerUpload({ value, onChange, invalid, error }: BannerUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onPick(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    setLocalError(null);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      setLocalError("Use JPEG, PNG or WebP.");
      return;
    }
    if (file.size > MAX_BANNER_BYTES) {
      setLocalError("Banner must be 2 MB or smaller.");
      return;
    }
    const okRatio = await checkAspectRatio(file);
    if (!okRatio) {
      setLocalError("Banner must be 16:9 (e.g. 1600×900).");
      return;
    }

    setUploading(true);
    try {
      const { url } = await browserApi.uploadMedia(file, "banner");
      onChange(url);
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
        16:9, JPG, PNG or WebP, up to 2 MB. Shown on every game card.
      </p>

      {value ? (
        <div className="relative aspect-video w-full max-w-xl overflow-hidden rounded-xl border border-border bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Banner preview" className="size-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
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
          <span>{uploading ? "Uploading..." : "Upload a banner"}</span>
          <span className="text-xs font-normal text-muted">16:9 · JPG / PNG / WebP · 2 MB</span>
        </label>
      )}

      {shownError && <p className="text-xs text-red-700">{shownError}</p>}
    </div>
  );
}
