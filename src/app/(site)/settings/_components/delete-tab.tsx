"use client";

import { useState } from "react";
import { browserApi, ApiError } from "@/lib/api";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

export default function DeleteTab() {
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirm.trim().toUpperCase() === "DELETE";

  async function handleDelete() {
    if (!canDelete || busy) return;
    setBusy(true);
    setError(null);
    try {
      await browserApi.deleteAccount();
      setDeleted(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete account");
      setBusy(false);
    }
  }

  return (
    <section
      className="rounded-2xl border p-6 sm:p-8"
      style={{ borderColor: "#D9A3B0", background: "#FFF1F3" }}
    >
      <header className="mb-4">
        <h2 className="font-display font-bold text-xl" style={{ color: "#8A1C35" }}>
          Delete account
        </h2>
      </header>

      {deleted ? (
        <p role="status" className="text-sm" style={{ color: "#8A1C35" }}>
          Your account is scheduled for deletion. You&apos;ll be logged out now.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text">
            This permanently removes your profile, your list and every game you listed. Games you
            listed disappear from SugarCane. This can&apos;t be undone.
          </p>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="delete-confirm" className="text-sm font-semibold text-text">
              Type DELETE to confirm
            </label>
            <Input
              id="delete-confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
            />
          </div>
          {error && (
            <p role="alert" className="text-sm" style={{ color: "#8A1C35" }}>
              {error}
            </p>
          )}
          <div>
            <Button
              variant="primary"
              onClick={handleDelete}
              disabled={!canDelete || busy}
              style={{ background: "#B4234A", color: "#FFFFFF" }}
            >
              {busy ? "Deleting..." : "Delete my account"}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
