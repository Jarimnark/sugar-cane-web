import type {
  CategoryDetailResponse,
  CommentListResponse,
  CommentSort,
  ConnectionStatus,
  CreateCommentPayload,
  CreateGamePayload,
  CreateProfilePayload,
  Game,
  GameComment,
  GameEventType,
  GameListFilter,
  HomeResponse,
  MasterOption,
  MyGame,
  OAuthProvider,
  SessionsSummary,
  SuggestResponse,
  UpdateProfilePayload,
  User,
} from "@/types/api";

const API_PREFIX = "/api/v1";

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
  const trimmedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const prefixed = `${trimmedBase}${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;
  const url = new URL(prefixed);
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

async function request<T>(
  baseUrl: string,
  path: string,
  options: RequestOptions,
  credentials: RequestCredentials | undefined,
) {
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
  if (base) return base;
  if (typeof window !== "undefined") return window.location.origin;
  throw new Error("NEXT_PUBLIC_API_URL is not set");
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
  getCategoryDetail: () => serverRequest<CategoryDetailResponse>("/category-detail"),
  listGames: (filter: GameListFilter) =>
    serverRequest<Game[]>("/game/list", { method: "POST", body: filter }),
  suggestGames: (q: string, signal?: AbortSignal) =>
    serverRequest<SuggestResponse>("/game/suggest", { query: { q }, signal }),
  getGame: (id: string) => serverRequest<Game>(`/game/${id}`),
  getRelatedGames: (id: string) => serverRequest<Game[]>(`/game/${id}/related`),
  getMyList: (sort?: string) =>
    serverRequest<Game[]>("/me/list", { query: { sort } }),
  getMyGames: () => serverRequest<MyGame[]>("/me/game"),
  getMyGame: (id: string) => serverRequest<MyGame>(`/me/game/${id}`),
  getConnections: () => serverRequest<ConnectionStatus[]>("/me/connections"),
  getSessions: () => serverRequest<SessionsSummary>("/me/sessions"),
  getGameComments: (
    gameId: string,
    opts?: { sort?: CommentSort; page?: number; limit?: number },
  ) =>
    serverRequest<CommentListResponse>(`/game/${gameId}/comments`, {
      query: { sort: opts?.sort, page: opts?.page, limit: opts?.limit },
    }),
};

export const browserApi = {
  getSession: (signal?: AbortSignal) => browserRequest<User>("/auth/me", { signal }),
  logout: () => browserRequest<void>("/auth/logout", { method: "POST" }),
  startOAuth: (provider: OAuthProvider) => {
    const base = browserBaseUrl().replace(/\/$/, "");
    window.location.href = `${base}${API_PREFIX}/auth/${provider}/start`;
  },

  getHome: () => browserRequest<HomeResponse>("/home"),
  getMasterOptions: () => browserRequest<MasterOption>("/master-option"),
  getCategoryDetail: () => browserRequest<CategoryDetailResponse>("/category-detail"),
  listGames: (filter: GameListFilter) =>
    browserRequest<Game[]>("/game/list", { method: "POST", body: filter }),
  suggestGames: (q: string, signal?: AbortSignal) =>
    browserRequest<SuggestResponse>("/game/suggest", { query: { q }, signal }),
  getGame: (id: string) => browserRequest<Game>(`/game/${id}`),
  getRelatedGames: (id: string) => browserRequest<Game[]>(`/game/${id}/related`),

  trackGameEvent: (id: string, type: GameEventType) =>
    browserRequest<void>(`/game/${id}/event`, { method: "POST", query: { type } }),

  likeGame: (id: string) => browserRequest<void>(`/game/${id}/like`, { method: "PUT" }),
  unlikeGame: (id: string) => browserRequest<void>(`/game/${id}/like`, { method: "DELETE" }),

  getMyList: (sort?: string) =>
    browserRequest<Game[]>("/me/list", { query: { sort } }),
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
  getConnections: () => browserRequest<ConnectionStatus[]>("/me/connections"),
  getSessions: () => browserRequest<SessionsSummary>("/me/sessions"),
  logoutEverywhere: () => browserRequest<void>("/me/sessions", { method: "DELETE" }),

  getMyGames: () => browserRequest<MyGame[]>("/me/game"),
  getMyGame: (id: string) => browserRequest<MyGame>(`/me/game/${id}`),
  saveMyGame: (payload: CreateGamePayload, publish = false) =>
    browserRequest<MyGame>("/me/game", {
      method: "POST",
      query: { publish },
      body: payload,
    }),
  deleteMyGame: (id: string) =>
    browserRequest<void>(`/me/game/${id}`, { method: "DELETE" }),

  uploadMedia: async (file: File, kind: "banner" | "screenshot") => {
    const base = browserBaseUrl().replace(/\/$/, "");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${base}${API_PREFIX}/me/game/screenshot?kind=${kind}`, {
      method: "POST",
      body: form,
      credentials: "include",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new ApiError(res.status, text || `upload failed with ${res.status}`, text);
    }
    return (await res.json()) as { url: string };
  },

  uploadScreenshot: async (file: File) =>
    browserApi.uploadMedia(file, "screenshot"),

  getGameComments: (
    gameId: string,
    opts?: { sort?: CommentSort; page?: number; limit?: number },
  ) =>
    browserRequest<CommentListResponse>(`/game/${gameId}/comments`, {
      query: { sort: opts?.sort, page: opts?.page, limit: opts?.limit },
    }),
  createComment: (gameId: string, payload: CreateCommentPayload) =>
    browserRequest<GameComment>(`/game/${gameId}/comments`, {
      method: "POST",
      body: payload,
    }),
  deleteComment: (commentId: string) =>
    browserRequest<void>(`/comment/${commentId}`, { method: "DELETE" }),
  likeComment: (commentId: string) =>
    browserRequest<void>(`/comment/${commentId}/like`, { method: "PUT" }),
  unlikeComment: (commentId: string) =>
    browserRequest<void>(`/comment/${commentId}/like`, { method: "DELETE" }),
};

export type ServerApi = typeof serverApi;
export type BrowserApi = typeof browserApi;
