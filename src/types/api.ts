export interface User {
  id: string;
  email: string;
  display_name: string;
  bio?: string;
  photo_url?: string;
  email_verified: boolean;
  created_at: string;
}

export type PlayStyleSlug =
  | "casual"
  | "co-op"
  | "pvp"
  | "pve"
  | "story-driven"
  | "fast-reflex"
  | "brain";

export type PlayerCountSlug = "single-player" | "local-2p" | "online-multiplayer";

export interface Game {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  dev?: string;
  pitch: string;
  description: string;
  link_web?: string;
  link_android?: string;
  link_ios?: string;
  bg?: string;
  banner?: string;
  play_style?: PlayStyleSlug;
  play_style_label?: string;
  players: string;
  tags: string[];
  genres?: OptionItem[];
  platforms?: OptionItem[];
  video_links?: string[];
  screenshots?: string[];
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
  play_styles: OptionItem[];
  player_counts: OptionItem[];
}

export interface CategoryDetailResponse {
  genres: CategoryItem[];
  platforms: CategoryItem[];
}

export type GameSort = "popular" | "most_liked" | "newest";

export interface GameListFilter {
  sort?: GameSort;
  genre_id?: string;
  platform_id?: string;
  q?: string;
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
  dev?: string;
  pitch: string;
  description: string;
  link_web?: string;
  link_android?: string;
  link_ios?: string;
  bg?: string;
  banner?: string;
  play_style?: PlayStyleSlug;
  players: string;
  tags?: string[];
  genre_ids?: string[];
  platform_ids?: string[];
  video_links?: string[];
  screenshots?: string[];
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

export interface ConnectionStatus {
  provider: OAuthProvider;
  linked: boolean;
  linked_at?: string;
}

export interface SessionListItem {
  id: string;
  user_agent?: string;
  ip_address?: string;
  created_at: string;
  last_used_at: string;
  expires_at: string;
  is_current: boolean;
}

export interface SessionsSummary {
  count: number;
  current_session_id: string;
  sessions: SessionListItem[];
}

export type CommentSort = "newest" | "top";

export interface GameComment {
  id: string;
  game_id: string;
  user_id: string;
  author_name: string;
  author_photo_url: string;
  is_developer: boolean;
  is_own: boolean;
  anonymous: boolean;
  content: string;
  like_count: number;
  liked: boolean;
  created_at: string;
}

export interface CommentListResponse {
  count: number;
  items: GameComment[];
}

export interface CreateCommentPayload {
  content: string;
  anonymous: boolean;
}
