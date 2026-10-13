import { NextRequest, NextResponse } from "next/server";
import { MOCK_USER } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  const { email, password } = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  // Mock: any non-empty credentials succeed
  const response = NextResponse.json({ user: MOCK_USER });
  response.cookies.set("session", "mock-session-token", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
