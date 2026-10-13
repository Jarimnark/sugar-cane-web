import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { serverApi, ApiError } from "@/lib/api";
import FirstTimeForm from "./first-time-form";

export const metadata: Metadata = {
  title: "Set up your profile",
};

export default async function FirstTimePage() {
  let user;
  try {
    user = await serverApi.getSession();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect("/login");
    }
    throw err;
  }

  if (user.display_name) {
    redirect("/");
  }

  return <FirstTimeForm defaultEmail={user.email} />;
}
