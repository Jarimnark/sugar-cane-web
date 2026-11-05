"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { browserApi, ApiError } from "@/lib/api";
import type { ConnectionStatus, OAuthProvider, SessionsSummary, User } from "@/types/api";
import Button from "@/components/ui/button";

const PROVIDER_LABELS: Record<OAuthProvider, string> = {
  google: "Google",
  facebook: "Facebook",
};

interface SecurityTabProps {
  user: User;
  connections: ConnectionStatus[];
  sessions: SessionsSummary;
}

export default function SecurityTab({ user, connections, sessions }: SecurityTabProps) {
  const router = useRouter();
  const [busyProvider, setBusyProvider] = useState<OAuthProvider | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [logoutState, setLogoutState] = useState<"idle" | "busy" | "done">("idle");
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleConnect(provider: OAuthProvider) {
    setBusyProvider(provider);
    setConnectionError(null);
    try {
      browserApi.startOAuth(provider);
    } catch (err) {
      setConnectionError(err instanceof ApiError ? err.message : `Failed to connect ${provider}`);
      setBusyProvider(null);
    }
  }

  async function handleDisconnect(provider: OAuthProvider) {
    setBusyProvider(provider);
    setConnectionError(null);
    try {
      await browserApi.unlinkConnection(provider);
      startTransition(() => router.refresh());
    } catch (err) {
      setConnectionError(err instanceof ApiError ? err.message : `Failed to disconnect ${provider}`);
    } finally {
      setBusyProvider(null);
    }
  }

  async function handleLogoutEverywhere() {
    setLogoutState("busy");
    setLogoutError(null);
    try {
      await browserApi.logoutEverywhere();
      setLogoutState("done");
      startTransition(() => router.refresh());
    } catch (err) {
      setLogoutError(err instanceof ApiError ? err.message : "Failed to log out everywhere");
      setLogoutState("idle");
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-bg p-6 sm:p-8">
      <header className="mb-6">
        <h2 className="font-display font-bold text-xl text-text">Login &amp; security</h2>
      </header>

      <div className="flex flex-col gap-3">
        <Row
          title="Email"
          detail={user.email}
        />

        {connections.map((conn) => {
          const label = PROVIDER_LABELS[conn.provider];
          const detail = conn.linked
            ? `Connected. You can log in with ${label}.`
            : "Not connected";
          const busy = busyProvider === conn.provider;
          return (
            <Row
              key={conn.provider}
              title={label}
              detail={detail}
              action={
                conn.linked ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDisconnect(conn.provider)}
                    disabled={busy}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleConnect(conn.provider)}
                    disabled={busy}
                  >
                    Connect {label}
                  </Button>
                )
              }
            />
          );
        })}
        {connectionError && (
          <p role="alert" className="text-sm text-red-600">
            {connectionError}
          </p>
        )}

        <Row
          title="Sessions"
          detail={
            logoutState === "done"
              ? "Logged out everywhere except this device."
              : `Logged in on ${sessions.count} device${sessions.count === 1 ? "" : "s"}.`
          }
          action={
            <Button
              size="sm"
              variant="secondary"
              onClick={handleLogoutEverywhere}
              disabled={logoutState === "busy" || sessions.count <= 1}
            >
              {logoutState === "busy" ? "Logging out..." : "Log out of all devices"}
            </Button>
          }
        />
        {logoutError && (
          <p role="alert" className="text-sm text-red-600">
            {logoutError}
          </p>
        )}
      </div>
    </section>
  );
}

function Row({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="font-semibold text-text">{title}</div>
        <div className="text-sm text-muted">{detail}</div>
      </div>
      {action}
    </div>
  );
}
