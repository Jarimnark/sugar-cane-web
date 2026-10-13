"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { browserApi, ApiError } from "@/lib/api";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import FormField from "@/components/ui/form-field";

interface FirstTimeFormProps {
  defaultEmail: string;
}

export default function FirstTimeForm({ defaultEmail }: FirstTimeFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) {
      setNameError("Display name is required");
      return;
    }
    setNameError(undefined);
    setFormError(undefined);
    setSubmitting(true);
    try {
      await browserApi.createProfile({
        display_name: trimmed,
        bio: bio.trim() || undefined,
      });
      router.replace("/");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message || "Could not save profile"
          : "Could not save profile";
      setFormError(message);
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="font-display font-extrabold text-3xl tracking-tight text-text">
          Welcome to SugarCane
        </h1>
        <p className="text-muted mt-2 text-sm">
          Tell us a bit about yourself to finish setting up your account.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <FormField id="email" label="Email">
          <Input id="email" value={defaultEmail} readOnly disabled />
        </FormField>

        <FormField id="displayName" label="Display name" error={nameError}>
          <Input
            id="displayName"
            name="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How should we call you?"
            maxLength={60}
            autoFocus
            required
            invalid={!!nameError}
          />
        </FormField>

        <FormField id="bio" label="Bio (optional)">
          <textarea
            id="bio"
            name="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short line about the games you love."
            maxLength={240}
            rows={3}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none transition-colors placeholder:text-muted focus:border-accent resize-none"
          />
        </FormField>

        {formError && (
          <p className="text-xs text-red-700" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth disabled={submitting}>
          {submitting ? "Saving..." : "Continue"}
        </Button>
      </form>
    </div>
  );
}
