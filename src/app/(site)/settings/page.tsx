import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { serverApi, ApiError } from "@/lib/api";
import type { ConnectionStatus, MyGame, SessionsSummary, User } from "@/types/api";
import SettingsForm from "./settings-form";

export const metadata: Metadata = {
  title: "Account Settings",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let user: User;
  try {
    user = await serverApi.getSession();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect("/login?next=/settings");
    }
    throw err;
  }

  const [connections, sessions, games] = await Promise.all([
    safeFetch<ConnectionStatus[]>(() => serverApi.getConnections(), []),
    safeFetch<SessionsSummary>(
      () => serverApi.getSessions(),
      { count: 1, current_session_id: "", sessions: [] },
    ),
    safeFetch<MyGame[]>(() => serverApi.getMyGames(), []),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <header className="mb-10">
        <h1 className="font-display font-extrabold text-3xl tracking-tight text-text">
          Account settings
        </h1>
      </header>
      <SettingsForm
        user={user}
        connections={connections}
        sessions={sessions}
        games={games}
      />
    </div>
  );
}

async function safeFetch<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}
