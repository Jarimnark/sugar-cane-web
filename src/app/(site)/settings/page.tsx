import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { serverApi, ApiError } from "@/lib/api";
import SettingsForm from "./settings-form";

export const metadata: Metadata = {
  title: "Account Settings",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let user;
  try {
    user = await serverApi.getSession();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect("/login?next=/settings");
    }
    throw err;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <header className="mb-10">
        <h1 className="font-display font-extrabold text-3xl tracking-tight text-text">
          Account settings
        </h1>
        <p className="text-muted mt-2">Manage your profile, linked accounts, and session.</p>
      </header>
      <SettingsForm user={user} />
    </div>
  );
}
