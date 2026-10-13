import { NextResponse } from "next/server";

export async function GET() {
  const apiUrl = process.env.API_URL;

  // In production this redirects to the Go API which handles the full OAuth flow.
  if (apiUrl) {
    return NextResponse.redirect(`${apiUrl}/auth/google`);
  }

  // Dev fallback: mock a successful OAuth login so the UI can be tested without the Go API.
  const response = NextResponse.redirect(new URL("/", process.env.SITE_URL ?? "http://localhost:3000"));
  response.cookies.set("session", "mock-google-session", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
