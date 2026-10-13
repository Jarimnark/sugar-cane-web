import type {
  CategoryDetailResponse,
  CreateGamePayload,
  CreateProfilePayload,
  Game,
  GameEventPayload,
  GameListFilter,
  GameListResponse,
  HomeResponse,
  MasterOption,
  MyGame,
  MyGameListResponse,
  MyListResponse,
  OAuthProvider,
  SuggestResponse,
  UpdateProfilePayload,
  User,
} from "@/types/api";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: string;
  query?: Record<string, string | number | boolean | string[] | undefined>;
  body?: unknown;
  cookie?: string;
  cache?: RequestCache;
  next?: { revalidate?: number | false; tags?: string[] };
  signal?: AbortSignal;
}

function buildUrl(base: string, path: string, query?: RequestOptions["query"]) {
  const url = new URL(path.replace(/^\//, ""), base.endsWith("/") ? base : `${base}/`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        for (const v of value) url.searchParams.append(key, String(v));
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function request<T>(baseUrl: string, path: string, options: RequestOptions, credentials: RequestCredentials | undefined) {
  const { method = "GET", query, body, cookie, cache, next, signal } = options;
  const url = buildUrl(baseUrl, path, query);
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;

  const res = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials,
    cache,
    next,
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(res.status, text || `${method} ${path} failed with ${res.status}`, text);
  }

  if (res.status === 204) return undefined as T;
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return undefined as T;
  return (await res.json()) as T;
}

function serverBaseUrl() {
  const base = process.env.API_URL;
  if (!base) throw new Error("API_URL is not set");
  return base;
}

function browserBaseUrl() {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is not set");
  return base;
}

async function serverRequest<T>(path: string, options: RequestOptions = {}) {
  let cookie = options.cookie;
  if (cookie === undefined) {
    const { headers } = await import("next/headers");
    const list = await headers();
    cookie = list.get("cookie") ?? undefined;
  }
  return request<T>(serverBaseUrl(), path, { ...options, cookie }, undefined);
}

async function browserRequest<T>(path: string, options: RequestOptions = {}) {
  return request<T>(browserBaseUrl(), path, options, "include");
}

export const serverApi = {
  getSession: () => serverRequest<User>("/auth/me"),
  getHome: () => serverRequest<HomeResponse>("/home"),
  getMasterOptions: () => serverRequest<MasterOption>("/master-option"),
  getCategoryDetail: () => serverRequest<CategoryDetailResponse>("/catagory-detail"),
  listGames: (filter: GameListFilter) =>
    serverRequest<GameListResponse>("/game/list", { method: "POST", body: filter }),
  suggestGames: (q: string, signal?: AbortSignal) =>
    serverRequest<SuggestResponse>("/game/suggest", { query: { q }, signal }),
  getGame: (id: string) => serverRequest<Game>(`/game/${id}`),
  getRelatedGames: (id: string) => serverRequest<GameListResponse>(`/game/${id}/related`),
  getMyList: (sort?: "added" | "name") =>
    serverRequest<MyListResponse>("/me/list", { query: { sort } }),
  getMyGames: () => serverRequest<MyGameListResponse>("/me/game"),
  getMyGame: (id: string) => serverRequest<MyGame>(`/me/game/${id}`),
};

export const browserApi = {
  getSession: (signal?: AbortSignal) => browserRequest<User>("/auth/me", { signal }),
  logout: () => browserRequest<void>("/auth/logout", { method: "POST" }),
  startOAuth: (provider: OAuthProvider) => {
    window.location.href = `${browserBaseUrl().replace(/\/$/, "")}/auth/${provider}/start`;
  },

  getHome: () => browserRequest<HomeResponse>("/home"),
  getMasterOptions: () => browserRequest<MasterOption>("/master-option"),
  getCategoryDetail: () => browserRequest<CategoryDetailResponse>("/catagory-detail"),
  listGames: (filter: GameListFilter) =>
    browserRequest<GameListResponse>("/game/list", { method: "POST", body: filter }),
  suggestGames: (q: string, signal?: AbortSignal) =>
    browserRequest<SuggestResponse>("/game/suggest", { query: { q }, signal }),
  getGame: (id: string) => browserRequest<Game>(`/game/${id}`),
  getRelatedGames: (id: string) => browserRequest<GameListResponse>(`/game/${id}/related`),

  trackGameEvent: (id: string, payload: GameEventPayload) =>
    browserRequest<void>(`/game/${id}/event`, { method: "POST", body: payload }),

  likeGame: (id: string) => browserRequest<void>(`/game/${id}/like`, { method: "PUT" }),
  unlikeGame: (id: string) => browserRequest<void>(`/game/${id}/like`, { method: "DELETE" }),

  getMyList: (sort?: "added" | "name") =>
    browserRequest<MyListResponse>("/me/list", { query: { sort } }),
  addToMyList: (id: string) => browserRequest<void>(`/me/list/${id}`, { method: "PUT" }),
  removeFromMyList: (id: string) =>
    browserRequest<void>(`/me/list/${id}`, { method: "DELETE" }),

  updateProfile: (payload: UpdateProfilePayload) =>
    browserRequest<User>("/me", { method: "PATCH", body: payload }),
  createProfile: (payload: CreateProfilePayload) =>
    browserRequest<User>("/me/profile", { method: "POST", body: payload }),
  deleteAccount: () => browserRequest<void>("/me", { method: "DELETE" }),
  linkConnection: (provider: OAuthProvider) =>
    browserRequest<void>(`/me/connection/${provider}`, { method: "POST" }),
  unlinkConnection: (provider: OAuthProvider) =>
    browserRequest<void>(`/me/connection/${provider}`, { method: "DELETE" }),

  getMyGames: () => browserRequest<MyGameListResponse>("/me/game"),
  getMyGame: (id: string) => browserRequest<MyGame>(`/me/game/${id}`),
  saveMyGame: (payload: CreateGamePayload & { id?: string }, publish = false) =>
    browserRequest<MyGame>("/me/game", {
      method: "POST",
      query: { action: "update", publish },
      body: payload,
    }),
  deleteMyGame: (id: string) =>
    browserRequest<void>(`/me/game/${id}`, { method: "DELETE" }),
};

export type ServerApi = typeof serverApi;
export type BrowserApi = typeof browserApi;
