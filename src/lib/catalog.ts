import type { PlayStyleSlug, PlayerCountSlug } from "@/types/api";

export const PLAY_STYLE_LABELS: Record<PlayStyleSlug, string> = {
  casual: "Casual",
  "co-op": "Co-op",
  pvp: "PvP",
  pve: "PvE",
  "story-driven": "Story-Driven",
  "fast-reflex": "Fast Reflex",
  brain: "Brain",
};

export const PLAY_STYLE_ORDER: PlayStyleSlug[] = [
  "casual",
  "co-op",
  "pvp",
  "pve",
  "story-driven",
  "fast-reflex",
  "brain",
];

export const PLAYER_COUNT_LABELS: Record<PlayerCountSlug, string> = {
  "single-player": "1 Player",
  "local-2p": "2 Players (Same Device)",
  "online-multiplayer": "Online Multiplayer",
};

export const PLAYER_COUNT_ORDER: PlayerCountSlug[] = [
  "single-player",
  "local-2p",
  "online-multiplayer",
];

export const PLAYERS_OPTIONS = PLAYER_COUNT_ORDER.map((value) => ({
  value,
  label: PLAYER_COUNT_LABELS[value],
}));

export const MAX_GENRES = 3;
export const MIN_GENRES = 1;
export const MIN_PLATFORMS = 1;

export const MAX_SCREENSHOTS = 6;
export const MAX_SCREENSHOT_BYTES = 2 * 1024 * 1024;
export const MAX_BANNER_BYTES = 2 * 1024 * 1024;

export const MAX_VIDEO_LINKS = 3;
export const MAX_TAGS = 5;
export const MAX_PITCH_CHARS = 160;
export const MAX_DESCRIPTION_CHARS = 2000;
export const MIN_DESCRIPTION_CHARS = 20;
export const MAX_NAME_CHARS = 60;

export const BANNER_ASPECT_RATIO = 16 / 9;
export const BANNER_ASPECT_TOLERANCE = 0.02;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const EMOJI_SET: Array<[string, string]> = [
  ["😀", "grinning face"],
  ["😂", "laughing"],
  ["😍", "heart eyes"],
  ["🤩", "star struck"],
  ["😎", "cool"],
  ["🔥", "fire"],
  ["⚔️", "swords"],
  ["🛡️", "shield"],
  ["🏹", "bow"],
  ["🐉", "dragon"],
  ["👑", "crown"],
  ["💎", "gem"],
  ["🎮", "game controller"],
  ["🏆", "trophy"],
  ["🌊", "wave"],
  ["🚀", "rocket"],
  ["✨", "sparkles"],
  ["🎉", "party"],
];

export const FILE_DOWNLOAD_EXT_RE =
  /\.(apk|aab|xapk|ipa|exe|msi|dmg|pkg|zip|rar|7z|tar|gz|jar|bat|cmd|sh|bin|iso|deb|rpm|appimage)([?#]|$)/i;

export const VIDEO_URL_RE =
  /^https:\/\/(www\.|m\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/|drive\.google\.com\/(file\/d\/|open\?id=))/i;

export const ANDROID_URL_RE =
  /^https:\/\/play\.google\.com\/store\/apps\/details\?id=[\w.]+/;

export const IOS_URL_RE = /^https:\/\/apps\.apple\.com\//;
