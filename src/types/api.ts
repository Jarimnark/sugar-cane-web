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
  badge?: string;
}

export interface User {
  id: string;
  displayName: string;
  photoUrl?: string;
  bio?: string;
  email: string;
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

export interface GameListParams {
  q?: string;
  genre?: string;
  platform?: string;
  sort?: "popular" | "newest" | "az";
  offset?: number;
  limit?: number;
}
