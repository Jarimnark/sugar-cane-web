import { NextRequest, NextResponse } from "next/server";
import { MOCK_USER } from "@/lib/mock-data";
import type { User } from "@/types/api";

export async function GET() {
  return NextResponse.json(MOCK_USER);
}

export async function PUT(request: NextRequest) {
  const body = (await request.json()) as Partial<User>;
  const updated: User = { ...MOCK_USER, ...body, id: MOCK_USER.id };
  return NextResponse.json(updated);
}
