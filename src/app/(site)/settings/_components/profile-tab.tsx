"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { browserApi, ApiError } from "@/lib/api";
import type { User } from "@/types/api";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import FormField from "@/components/ui/form-field";

type Status = { kind: "idle" } | { kind: "saving" } | { kind: "ok" } | { kind: "error"; message: string };

const BIO_MAX = 160;
const NAME_MAX = 40;

export default function ProfileTab({ user }: { user: User }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user.display_name);
  const [bio, setBio] = useState(user.bio ?? "");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [, startTransition] = useTransition();

  const initial = (displayName || user.email || "?").charAt(0).toUpperCase();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "saving" });
    try {
      await browserApi.updateProfile({
        display_name: displayName,
        bio: bio || undefined,
      });
      setStatus({ kind: "ok" });
      startTransition(() => router.refresh());
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to save profile";
      setStatus({ kind: "error", message });
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-bg p-6 sm:p-8">
      <header className="mb-6">
        <h2 className="font-display font-bold text-xl text-text">Profile</h2>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex items-center gap-5">
          <div className="size-16 rounded-full bg-surface border border-border flex items-center justify-center">
            <span className="font-display font-bold text-xl text-text">{initial}</span>
          </div>
          <div className="text-sm text-muted">
            <div className="text-text font-semibold">{user.email}</div>
          </div>
        </div>

        <FormField id="displayName" label="Display name">
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={NAME_MAX}
            required
          />
          <p className="text-xs text-muted mt-1">
            Shown on games you list and in your profile.
          </p>
        </FormField>

        <FormField id="bio" label="Bio">
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
            rows={3}
            maxLength={BIO_MAX}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none transition-colors placeholder:text-muted focus:border-accent resize-none"
            placeholder="A line about you or your studio"
          />
          <p className="text-xs text-muted mt-1 text-right">
            {bio.length} / {BIO_MAX}
          </p>
        </FormField>

        <div className="flex items-center gap-4">
          <Button type="submit" variant="primary" disabled={status.kind === "saving"}>
            {status.kind === "saving" ? "Saving..." : "Save changes"}
          </Button>
          {status.kind === "ok" && (
            <span role="status" className="text-sm text-accent">
              Profile saved
            </span>
          )}
          {status.kind === "error" && (
            <span role="alert" className="text-sm text-red-600">
              {status.message}
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
