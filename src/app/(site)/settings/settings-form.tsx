"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { browserApi, ApiError } from "@/lib/api";
import type { OAuthProvider, User } from "@/types/api";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import FormField from "@/components/ui/form-field";

interface SettingsFormProps {
  user: User;
}

type ProfileStatus = { kind: "idle" } | { kind: "saving" } | { kind: "ok" } | { kind: "error"; message: string };

export default function SettingsForm({ user }: SettingsFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user.display_name);
  const [bio, setBio] = useState(user.bio ?? "");
  const [status, setStatus] = useState<ProfileStatus>({ kind: "idle" });
  const [connectionBusy, setConnectionBusy] = useState<OAuthProvider | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function handleProfileSubmit(e: React.FormEvent) {
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

  function handleLinkConnection(provider: OAuthProvider) {
    setConnectionBusy(provider);
    setConnectionError(null);
    try {
      browserApi.startOAuth(provider);
    } catch (err) {
      setConnectionError(err instanceof ApiError ? err.message : `Failed to link ${provider}`);
      setConnectionBusy(null);
    }
  }

  async function handleUnlinkConnection(provider: OAuthProvider) {
    setConnectionBusy(provider);
    setConnectionError(null);
    try {
      await browserApi.unlinkConnection(provider);
      startTransition(() => router.refresh());
    } catch (err) {
      setConnectionError(err instanceof ApiError ? err.message : `Failed to unlink ${provider}`);
    } finally {
      setConnectionBusy(null);
    }
  }

  async function handleLogout() {
    try {
      await browserApi.logout();
    } finally {
      window.location.href = "/";
    }
  }

  async function handleDeleteAccount() {
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await browserApi.deleteAccount();
      window.location.href = "/";
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Failed to delete account");
      setDeleteBusy(false);
    }
  }

  const photoUrl = user.photo_url ?? "";
  const avatarInitial = (displayName || user.email || "?").charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-10">
      <section className="rounded-2xl border border-border bg-bg p-6 sm:p-8">
        <header className="mb-6">
          <h2 className="font-display font-bold text-xl text-text">Profile</h2>
          <p className="text-sm text-muted mt-1">
            How your name and photo appear across SugarCane.
          </p>
        </header>

        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-5">
          <div className="flex items-center gap-5">
            <div
              className="size-16 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden"
              style={photoUrl && !isHttpUrl(photoUrl) ? { background: photoUrl } : undefined}
            >
              {isHttpUrl(photoUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" className="size-full object-cover" />
              ) : (
                <span className="font-display font-bold text-xl text-text">{avatarInitial}</span>
              )}
            </div>
            <div className="text-sm text-muted">
              <div className="text-text font-semibold">{user.email}</div>
              <div>Image upload coming soon</div>
            </div>
          </div>

          <FormField id="displayName" label="Display name">
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={60}
              required
            />
          </FormField>

          <FormField id="bio" label="Bio">
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={280}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none transition-colors placeholder:text-muted focus:border-accent resize-none"
              placeholder="A short bio to show on your profile"
            />
          </FormField>

          <div className="flex items-center gap-4">
            <Button type="submit" variant="primary" disabled={status.kind === "saving"}>
              {status.kind === "saving" ? "Saving..." : "Save changes"}
            </Button>
            {status.kind === "ok" && <span className="text-sm text-accent">Saved</span>}
            {status.kind === "error" && (
              <span className="text-sm text-red-600">{status.message}</span>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-bg p-6 sm:p-8">
        <header className="mb-6">
          <h2 className="font-display font-bold text-xl text-text">Connections</h2>
          <p className="text-sm text-muted mt-1">
            Sign in to SugarCane with any linked account.
          </p>
        </header>

        <ul className="flex flex-col gap-3">
          <ConnectionRow
            provider="google"
            label="Google"
            busy={connectionBusy === "google"}
            onLink={() => handleLinkConnection("google")}
            onUnlink={() => handleUnlinkConnection("google")}
          />
          <ConnectionRow
            provider="facebook"
            label="Facebook"
            busy={connectionBusy === "facebook"}
            onLink={() => handleLinkConnection("facebook")}
            onUnlink={() => handleUnlinkConnection("facebook")}
          />
        </ul>
        {connectionError && (
          <p className="text-sm text-red-600 mt-4">{connectionError}</p>
        )}
      </section>

      <section className="rounded-2xl border border-red-200 bg-bg p-6 sm:p-8">
        <header className="mb-6">
          <h2 className="font-display font-bold text-xl text-text">Danger zone</h2>
          <p className="text-sm text-muted mt-1">
            Log out of this device or delete your account permanently.
          </p>
        </header>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" onClick={handleLogout}>
            Log out
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(true)}
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            Delete account
          </Button>
        </div>
      </section>

      {showDeleteModal && (
        <DeleteConfirmModal
          busy={deleteBusy}
          error={deleteError}
          onConfirm={handleDeleteAccount}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteError(null);
          }}
        />
      )}
    </div>
  );
}

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

interface ConnectionRowProps {
  provider: OAuthProvider;
  label: string;
  busy: boolean;
  onLink: () => void;
  onUnlink: () => void;
}

function ConnectionRow({ label, busy, onLink, onUnlink }: ConnectionRowProps) {
  return (
    <li className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
      <div>
        <div className="font-semibold text-text">{label}</div>
        <div className="text-xs text-muted">Not linked</div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={onLink} disabled={busy}>
          Link
        </Button>
        <Button size="sm" variant="ghost" onClick={onUnlink} disabled={busy}>
          Unlink
        </Button>
      </div>
    </li>
  );
}

interface DeleteConfirmModalProps {
  busy: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmModal({ busy, error, onConfirm, onCancel }: DeleteConfirmModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const canDelete = confirmText.trim().toUpperCase() === "DELETE";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-text/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-bg p-6 shadow-xl">
        <h3 id="delete-title" className="font-display font-bold text-xl text-text">
          Delete your account?
        </h3>
        <p className="text-sm text-muted mt-2">
          This permanently removes your profile, lists, and games. Type{" "}
          <span className="font-semibold text-text">DELETE</span> to confirm.
        </p>
        <div className="mt-4">
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            autoFocus
          />
        </div>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={!canDelete || busy}
            className="bg-red-600 text-white hover:bg-red-700 hover:opacity-100"
          >
            {busy ? "Deleting..." : "Delete account"}
          </Button>
        </div>
      </div>
    </div>
  );
}
