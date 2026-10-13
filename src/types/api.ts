export interface User {
  id: string;
  email: string;
  display_name: string;
  bio?: string;
  photo_url?: string;
  email_verified: boolean;
  created_at: string;
}

export interface Game {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  dev: string;
  pitch: string;
  description: string;
  link_web?: string;
  link_android?: string;
  link_ios?: string;
  bg: string;
  players: string;
  tags: string[];
  status: "draft" | "published";
  like_count: number;
  visit_count: number;
  badge?: string;
  created_at: string;
  liked?: boolean;
  in_my_list?: boolean;
}

export interface OptionItem {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  game_count: number;
}

export interface MasterOption {
  genres: OptionItem[];
  platforms: OptionItem[];
}

export interface CategoryDetailResponse {
  genres: CategoryItem[];
  platforms: CategoryItem[];
}

export interface GameListFilter {
  sort?: string;
  genre_id?: string;
  platform_id?: string;
  page?: number;
  limit?: number;
}

export interface HomeResponse {
  trending: Game[];
  popular: Game[];
  new: Game[];
}

export type SuggestResponse = string[];

export type GameEventType = "click" | "play" | "impression";

export type MyGame = Game;

export interface CreateGamePayload {
  id?: string;
  slug: string;
  name: string;
  dev: string;
  pitch: string;
  description: string;
  link_web?: string;
  link_android?: string;
  link_ios?: string;
  bg: string;
  players: string;
  tags?: string[];
}

export interface UpdateProfilePayload {
  display_name: string;
  bio?: string;
}

export interface CreateProfilePayload {
  display_name: string;
  bio?: string;
}

export type OAuthProvider = "google" | "facebook";
