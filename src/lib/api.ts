const API_URL = process.env.API_URL;

if (!API_URL && typeof window === "undefined") {
  console.warn("[api] API_URL is not set — server-side requests will fail");
}

interface FetchOptions extends RequestInit {
  cookie?: string;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const url = `${API_URL}${path}`;
  const { cookie, ...init } = options;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, await res.text());
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
