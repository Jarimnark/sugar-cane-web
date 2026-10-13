import type { Game, User } from "@/types/api";

export interface MockCategory {
  label: string;
  slug: string;
  count: number;
}

export interface MockPlatform {
  label: string;
  slug: string;
  count: number;
}

const OWNER_ID = "00000000-0000-0000-0000-000000000001";
const CREATED_AT = "2026-01-01T00:00:00Z";

export const MOCK_GAMES: Game[] = [
  {
    id: "1",
    owner_id: OWNER_ID,
    slug: "celeste-classic",
    name: "Celeste Classic",
    link_web: "https://www.lexaloffle.com/bbs/?tid=2145",
    dev: "Maddy Thorson & Noel Berry",
    players: "1",
    tags: ["Platformer", "Puzzle", "pixel"],
    pitch: "Climb a mountain. Discover yourself.",
    description:
      "A tiny mountain-climbing platformer. Help Madeline survive her inner demons on her journey to the top of Celeste Mountain.",
    bg: "#3d6b8a",
    like_count: 482,
    visit_count: 0,
    status: "published",
    badge: "Hot",
    created_at: CREATED_AT,
  },
  {
    id: "2",
    owner_id: OWNER_ID,
    slug: "2048",
    name: "2048",
    link_web: "https://play2048.co",
    dev: "Gabriele Cirulli",
    players: "1",
    tags: ["Puzzle", "Idle", "numbers"],
    pitch: "Slide tiles, reach 2048.",
    description:
      "Join the numbers and get to the 2048 tile. A deceptively simple puzzle that gets incredibly hard.",
    bg: "#b8a07a",
    like_count: 1204,
    visit_count: 0,
    status: "published",
    badge: "Classic",
    created_at: CREATED_AT,
  },
  {
    id: "3",
    owner_id: OWNER_ID,
    slug: "slither-io",
    name: "Slither.io",
    link_web: "https://slither.io",
    dev: "Steve Howse",
    players: "multi",
    tags: ["Multiplayer", "Arcade", "competitive"],
    pitch: "Eat, grow, dominate.",
    description:
      "Control a snake and eat glowing orbs to grow longer. Trap other players and eat their remains.",
    bg: "#2d7a3a",
    like_count: 876,
    visit_count: 0,
    status: "published",
    created_at: CREATED_AT,
  },
  {
    id: "4",
    owner_id: OWNER_ID,
    slug: "chess-com",
    name: "Chess.com",
    link_web: "https://www.chess.com/play/online",
    dev: "Chess.com",
    players: "2",
    tags: ["Strategy", "Multiplayer", "classic"],
    pitch: "The world's most popular chess platform.",
    description:
      "Play chess online against players of all skill levels. Rated games, puzzles, and lessons.",
    bg: "#6b7a3d",
    like_count: 2310,
    visit_count: 0,
    status: "published",
    badge: "Popular",
    created_at: CREATED_AT,
  },
  {
    id: "5",
    owner_id: OWNER_ID,
    slug: "cookie-clicker",
    name: "Cookie Clicker",
    link_web: "https://orteil.dashnet.org/cookieclicker/",
    dev: "Orteil",
    players: "1",
    tags: ["Idle", "clicker", "incremental"],
    pitch: "Click the cookie. Build an empire.",
    description:
      "An idle game where you bake cookies to rule the universe. Start with a single click and expand into an unstoppable cookie empire.",
    bg: "#8a5a2d",
    like_count: 643,
    visit_count: 0,
    status: "published",
    created_at: CREATED_AT,
  },
  {
    id: "6",
    owner_id: OWNER_ID,
    slug: "wordle",
    name: "Wordle",
    link_web: "https://www.nytimes.com/games/wordle/index.html",
    dev: "Josh Wardle / NYT",
    players: "1",
    tags: ["Puzzle", "word", "daily"],
    pitch: "One word. Six guesses. One chance a day.",
    description:
      "Guess the five-letter word in six attempts. Share your result without spoilers.",
    bg: "#4a7a4a",
    like_count: 3821,
    visit_count: 0,
    status: "published",
    badge: "New",
    created_at: CREATED_AT,
  },
  {
    id: "7",
    owner_id: OWNER_ID,
    slug: "krunker-io",
    name: "Krunker.io",
    link_web: "https://krunker.io",
    dev: "Sidney de Vries",
    players: "multi",
    tags: ["Action", "Multiplayer", "fps"],
    pitch: "Browser FPS that actually feels good.",
    description:
      "A fast-paced first-person shooter playable in any browser. No download needed — just jump in and fight.",
    bg: "#5a3d7a",
    like_count: 1098,
    visit_count: 0,
    status: "published",
    created_at: CREATED_AT,
  },
  {
    id: "8",
    owner_id: OWNER_ID,
    slug: "agar-io",
    name: "Agar.io",
    link_web: "https://agar.io",
    dev: "Miniclip",
    players: "multi",
    tags: ["Multiplayer", "Arcade", "casual"],
    pitch: "Eat smaller cells. Avoid bigger ones.",
    description:
      "Control a cell and eat other players to grow. Avoid being eaten yourself. Simple rules, endless competition.",
    bg: "#7a3d5a",
    like_count: 765,
    visit_count: 0,
    status: "published",
    created_at: CREATED_AT,
  },
];

export const MOCK_CATEGORIES: MockCategory[] = [
  { label: "Puzzle", slug: "puzzle", count: 3 },
  { label: "Action", slug: "action", count: 1 },
  { label: "Strategy", slug: "strategy", count: 1 },
  { label: "Arcade", slug: "arcade", count: 2 },
  { label: "Idle", slug: "idle", count: 2 },
  { label: "Multiplayer", slug: "multiplayer", count: 4 },
];

export const MOCK_PLATFORMS: MockPlatform[] = [
  { label: "Browser", slug: "browser", count: 8 },
  { label: "Mobile", slug: "mobile", count: 5 },
];

export const MOCK_USER: User = {
  id: "00000000-0000-0000-0000-000000000099",
  display_name: "Player One",
  photo_url: undefined,
  bio: "I play games in my browser.",
  email: "player@example.com",
  email_verified: true,
  created_at: CREATED_AT,
};

export const MOCK_USER_LIST_SLUGS = ["celeste-classic", "2048", "wordle"];
