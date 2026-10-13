export interface User {
  id: string;
  displayName: string;
  photoUrl?: string;
  bio?: string;
  email: string;
}

export interface Game {
  id: string;
  slug: string;
  name: string;
  link: string;
  domain: string;
  dev: string;
  genre: string[];
  platforms: string[];
  players: string;
  tags: string[];
  pitch: string;
  description: string;
  bg: string;
  likeCount: number;
  liked?: boolean;
  inMyList?: boolean;
  badge?: string;
}

export interface Category {
  label: string;
  slug: string;
  count: number;
}

export interface Platform {
  label: string;
  slug: string;
  count: number;
}

export interface MasterOption {
  genres: Category[];
  platforms: Platform[];
  players: string[];
  tags: string[];
}

export interface MyListEntry {
  game: Game;
  addedAt: string;
  note?: string;
}

export interface GameListFilter {
  q?: string;
  genre?: string | string[];
  platform?: string | string[];
  tags?: string[];
  sort?: "popular" | "newest" | "az";
  offset?: number;
  limit?: number;
}

export interface GameListResponse {
  items: Game[];
  total: number;
  offset: number;
  limit: number;
}

export type GameListParams = GameListFilter;

export interface HomeResponse {
  hero: Game | null;
  mostPopular: Game[];
  newThisWeek: Game[];
}

export interface SuggestResponse {
  items: Array<Pick<Game, "id" | "slug" | "name" | "bg">>;
}

export interface CategoryDetailResponse {
  genres: Category[];
  platforms: Platform[];
}

export interface GameEventPayload {
  type: "click" | "play" | "impression";
  source?: string;
}

export interface MyListResponse {
  items: MyListEntry[];
}

export interface MyGame extends Game {
  updatedAt: string;
  published: boolean;
}

export interface MyGameListResponse {
  items: MyGame[];
}

export interface CreateGamePayload {
  name: string;
  link: string;
  pitch?: string;
  description?: string;
  genre?: string[];
  platforms?: string[];
  players?: string;
  tags?: string[];
  bg?: string;
}

export interface UpdateProfilePayload {
  displayName?: string;
  bio?: string;
  photoUrl?: string;
}

export interface CreateProfilePayload {
  displayName: string;
  bio?: string;
}

export type OAuthProvider = "google" | "facebook";
