# TEAM.md — multi-agent coordination

> **Read this first.** You are one of several agents working on SugarCane in parallel git worktrees. This file is the single source of truth for ownership, overlap, and shared contracts. Update it whenever you touch a shared zone.

---

## Roster

Each agent works in its own worktree on its own feature branch. All branches are cut from `main` at `5f76fe1`.

| Agent | Worktree path | Branch | Page owned | Design board |
|---|---|---|---|---|
| `isopod` | `~/orca/workspaces/sugar-cane-web/isopod` | `feat/home-page` | Home (`src/app/(site)/page.tsx`) | Home — 1440×2480 |
| `bass` | `~/orca/workspaces/sugar-cane-web/bass` | `feat/browse-page` | Browse (`src/app/(site)/browse/`) | Browse (category) — 1440×1700 |
| `coffinfish` | `~/orca/workspaces/sugar-cane-web/coffinfish` | `feat/create-game-page` | Create/edit game (`src/app/(site)/games/`) | Add new game — 1440×2100 |
| `melusine` | `~/orca/workspaces/sugar-cane-web/melusine` | `feat/my-list-page` | My list (`src/app/(site)/my-list/`) | My list — 1440×1200 |
| `taniwha` | `~/orca/workspaces/sugar-cane-web/taniwha` | `feat/setting-page` | Settings (`src/app/(site)/settings/`) | Account settings — 1440×1300 |

**Unassigned pages** (no owner yet — do not implement unless promoted):
- Log in + first-time profile — belongs under `src/app/(auth)/`
- Game page (detail view) — belongs under `src/app/(site)/games/[id]/`

---

## Design source

`~/Documents/SugarCane2.html` — bundled Claude Artifact with every board as a nested iframe. Open it in a browser to view your assigned board. Treat it as the visual spec. If a design detail is ambiguous, flag it in your report rather than guessing.

---

## Ownership rules

**You own:** your page folder and any sub-folders of it. You may freely create, edit, and delete inside your folder.

**You do not own:** any shared folder. Shared folders are listed below. Any change to a shared folder must follow the Shared-zone protocol.

**You never touch:** another agent's page folder. Full stop.

### Shared folders (all agents read, only coordinator writes)

| Path | Why it's shared |
|---|---|
| `src/lib/` | API client, utilities — every page uses it |
| `src/types/` | Shared TypeScript types mirroring the Go API |
| `src/components/ui/` | Primitives (buttons, cards, inputs, modals) |
| `src/components/layout/` | Nav, header, footer, shell |
| `src/app/layout.tsx`, `src/app/(site)/layout.tsx`, `src/app/(auth)/layout.tsx` | Shared shells |
| `src/app/api/` | Next.js route handlers |
| `src/middleware.ts` | Auth gate |
| `src/app/globals.css` | Global styles, design tokens |
| `next.config.ts`, `tsconfig.json`, `package.json`, `pnpm-lock.yaml` | Infra |

---

## Shared-zone protocol

If your page needs something from a shared folder:

1. **Check first.** Open the shared file. If what you need already exists, use it as-is.
2. **If it doesn't exist, do not add it yourself.** Stop. Report back to the coordinator (the human + their primary Claude session) with:
   - What you need (type, component, API call)
   - Proposed interface (prop shape, function signature)
   - Which other agents are likely to need the same thing
3. **The coordinator** reconciles with sibling agents, writes the shared piece once, updates `TEAM.md` with the new contract, and briefs everyone who needs it.
4. **Then** you pull the updated `TEAM.md` + shared file into your worktree and use it.

**Rationale:** two agents editing `src/lib/api.ts` or `src/types/api.ts` in parallel will produce merge conflicts and divergent interfaces. One hand on each shared file at a time.

---

## Shared contracts

> Filled in by the coordinator as shared pieces are introduced. Each agent must honor these.

### API client — `src/lib/api.ts`

- All API calls go through this module. Do not use `fetch` directly in page components.
- Server components: imported from the server; cookies forwarded automatically.
- Browser components: imported from the browser; must use `credentials: "include"`.
- Base URL: `API_URL` (server) or `NEXT_PUBLIC_API_URL` (browser) — never hardcoded.

### Types — `src/types/api.ts`

- One source of truth for request/response shapes mirroring the Go backend.
- When you need a new type, propose it; do not inline a one-off `type` in your page.

### UI primitives — `src/components/ui/`

- Reach for an existing primitive before building a new one.
- Styling: Tailwind utility classes using the built-in scale. **No raw pixel values in arbitrary brackets** (no `px-[10px]`, `w-[200px]`). Exceptions: tokens that have no Tailwind equivalent, documented inline.

### Design tokens

- Colors, fonts, spacing come from `src/app/globals.css` + Tailwind config.
- If the design uses a token not yet defined, propose it; do not hardcode a hex in your component.

---

## Backend API (Go — `sugar-cane-service`)

Base URL from `API_URL` (server) / `NEXT_PUBLIC_API_URL` (browser). All calls go through `src/lib/api.ts` — never `fetch` directly. Session cookie is forwarded automatically on the server; browser calls use `credentials: "include"`.

> "Owner" = the agent whose page is the primary consumer. "Shared" = used by multiple agents, likely via a shared hook/component.

### Auth

| Method | Path | Owner | Notes |
|---|---|---|---|
| GET | `/auth/:provider/start` | *login page (unassigned)* | OAuth entry |
| GET | `/auth/:provider/callback` | *login page (unassigned)* | OAuth return |
| GET | `/auth/me` | **shared** (middleware + layout) | Session check — one central hook |
| POST | `/auth/logout` | **shared** (header + settings) | Logout button |

### Settings (`taniwha` — `feat/setting-page`)

| Method | Path | Owner | Notes |
|---|---|---|---|
| POST | `/me/profile` | *login/first-time flow (unassigned)* | Create profile on first login |
| PATCH | `/me` | `taniwha` | Edit profile |
| POST | `/me/connection/:provider` | `taniwha` | Link account |
| DELETE | `/me/connection/:provider` | `taniwha` | Unlink account |
| DELETE | `/me` | `taniwha` | Delete account |

### Games — browsing & discovery

| Method | Path | Owner | Also used by |
|---|---|---|---|
| GET | `/home` | `isopod` | — |
| GET | `/master-option` | **shared** | `bass` (filters), `coffinfish` (dropdowns) |
| GET | `/catagory-detail` | `bass` | Categories dropdown counts |
| POST | `/game/list` | `bass` | Browse listing with filters |
| GET | `/game/suggest?q=` | **shared** (header search) | All pages via layout search |
| GET | `/game/:id` | *game detail page (unassigned)* | — |
| GET | `/game/:id/related` | *game detail page (unassigned)* | — |
| POST | `/game/:id/event` | **shared** (game card click) | `isopod`, `bass`, `melusine` — stat tracking |

### My List (`melusine` — `feat/my-list-page`)

| Method | Path | Owner | Also used by |
|---|---|---|---|
| PUT | `/game/:id/like` | **shared** (game card) | Any page with a game card |
| DELETE | `/game/:id/like` | **shared** (game card) | Any page with a game card |
| GET | `/me/list?sort=` | `melusine` | My list page |
| PUT | `/me/list/:id` | **shared** (game card "add") | `isopod`, `bass`, `melusine` |
| DELETE | `/me/list/:id` | `melusine` | Primary; also game card remove |

### Dev portion (`coffinfish` — `feat/create-game-page`)

| Method | Path | Owner | Notes |
|---|---|---|---|
| GET | `/me/game` | `coffinfish` | List own games, sorted by `updated_at` |
| POST | `/me/game?action=update&publish=false` | `coffinfish` | Create / update game |
| GET | `/me/game/:id` | `coffinfish` | Edit view |
| DELETE | `/me/game/:id` | `coffinfish` | Delete / archive |

### Cross-cutting primitives these endpoints imply

These are the shared pieces the coordinator will build once — do not patch locally:

- **`useSession()`** → wraps `GET /auth/me`, consumed by every page.
- **`<GameCard />`** → consumed by `isopod`, `bass`, `melusine`. Must bake in like/unlike (`PUT|DELETE /game/:id/like`), add-to-list (`PUT /me/list/:id`), and click tracking (`POST /game/:id/event`).
- **`<SearchBar />`** in header → `GET /game/suggest?q=`. Lives in `src/components/layout/`.
- **`getMasterOptions()`** → cached fetch of `/master-option`, used by filters and dropdowns.
- **Logout action** → `POST /auth/logout`, triggered from header dropdown and settings.

If your page needs one of these before the coordinator has built it, follow the Shared-zone protocol — do not inline it.

### Not to be built from scratch

`src/app/api/*` (Next.js route handlers in the current scaffold) are **not** the backend. All data comes from the Go API above. Treat anything under `src/app/api/` as legacy scaffolding unless the coordinator says otherwise.

---

## Communication

- Agents cannot talk to each other directly. All relay goes through the coordinator.
- When you report back, include:
  - What you built (files added/changed, in your worktree only)
  - What you need from shared zones (if anything)
  - What you noticed that may affect siblings (new type you'd like to share, a UI pattern you expect others will want, an API endpoint behavior that surprised you)
- Keep your reports under 300 words unless asked for more.

---

## Non-negotiable rules (from CLAUDE.md)

- **Config from env vars only.** Never hardcode URLs.
- **No tokens in localStorage.** Session is httpOnly cookie only.
- **Sanitize all user-generated HTML** before rendering.
- **Ownership is enforced by the API**, not the UI.
- **Never commit or push autonomously.** Ask the coordinator before any commit or PR.
- **No comments explaining what the code does.** Only comment when the *why* is non-obvious.

---

## Definition of done (per page)

- `pnpm lint` passes in your worktree
- `pnpm build` succeeds in your worktree
- Page renders in a browser and matches the assigned design board
- Any shared-zone need is resolved through the coordinator, not patched locally
- Report submitted to the coordinator with the summary above
