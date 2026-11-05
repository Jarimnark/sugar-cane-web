import { NextRequest } from "next/server";

const BACKEND = process.env.API_URL ?? "http://localhost:8080";

async function proxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const target = new URL(`/api/v1/${path.join("/")}`, BACKEND);
  for (const [k, v] of req.nextUrl.searchParams) target.searchParams.append(k, v);

  const headers = new Headers();
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);
  const ct = req.headers.get("content-type");
  if (ct) headers.set("content-type", ct);

  const body = ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer();

  const res = await fetch(target, {
    method: req.method,
    headers,
    body,
    redirect: "manual",
  });

  const resHeaders = new Headers();
  res.headers.forEach((value, key) => {
    if (key === "transfer-encoding" || key === "content-encoding") return;
    resHeaders.set(key, value);
  });
  return new Response(res.body, { status: res.status, headers: resHeaders });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
