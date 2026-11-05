"use client";

import { useState } from "react";
import type { ConnectionStatus, MyGame, SessionsSummary, User } from "@/types/api";
import Tabs, { type TabItem } from "@/components/ui/tabs";
import ProfileTab from "./_components/profile-tab";
import SecurityTab from "./_components/security-tab";
import GamesTab from "./_components/games-tab";
import DeleteTab from "./_components/delete-tab";

interface SettingsFormProps {
  user: User;
  connections: ConnectionStatus[];
  sessions: SessionsSummary;
  games: MyGame[];
}

const TABS: TabItem[] = [
  { value: "profile", label: "Profile" },
  { value: "security", label: "Login & security" },
  { value: "games", label: "My games" },
  { value: "delete", label: "Delete account" },
];

export default function SettingsForm({ user, connections, sessions, games }: SettingsFormProps) {
  const [tab, setTab] = useState("profile");

  return (
    <Tabs value={tab} onChange={setTab} items={TABS} ariaLabel="Settings">
      {tab === "profile" && <ProfileTab user={user} />}
      {tab === "security" && (
        <SecurityTab user={user} connections={connections} sessions={sessions} />
      )}
      {tab === "games" && <GamesTab games={games} />}
      {tab === "delete" && <DeleteTab />}
    </Tabs>
  );
}
