# CLAUDE.md — sugar-cane-web

## Project overview

Next.js (App Router) + TypeScript frontend for **SugarCane**, a web-game shelf platform.
Public pages are SSR/ISR for SEO; logged-in users get a dashboard to manage their content.
Backend is a Go API (`sugar-cane-service`) served at `API_URL` / `NEXT_PUBLIC_API_URL`.

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js (App Router), React, TypeScript |
| Package manager | pnpm |
| Linting | ESLint |
| Formatting | Prettier |
| Testing | Playwright (E2E) |
| Content editor | TBD — Tiptap (rich text) or Puck (block layout) |

## Git workflow

- `main` — production branch, always deployable
- Feature work lives on branches cut from `main` or a `release/*` branch
- Releases are cut by tagging (`git tag vX.Y.Z`)
- **Always ask before creating a commit or PR** — never commit or push autonomously
- **Exception (multi-agent coordinator):** in the worktree workflow documented in `TEAM.md`, the coordinator session may run `git commit`, `git merge`, `git rebase`, and `git push` on behalf of the user **after** receiving explicit per-step approval (e.g. an `AskUserQuestion` response of the form "approve as-is", "go ahead", or "confirm merge"). Approval is scoped to the single operation being proposed; a new operation requires a new approval.

## Commands

```bash
pnpm dev          # dev server
pnpm build        # production build
pnpm lint         # ESLint
pnpm format       # Prettier
pnpm test:e2e     # Playwright E2E (once configured)
```

## Naming conventions

- **Files/directories**: `kebab-case` (e.g. `user-profile.tsx`, `game-card/`)
- **React components**: `PascalCase` (e.g. `UserProfile`, `GameCard`)
- **Variables and functions**: `camelCase`
- **Environment variables**: `SCREAMING_SNAKE_CASE`

## Code style

- No comments unless the **why** is non-obvious — hidden constraints, surprising behavior, or workarounds for specific bugs
- Never explain what the code does; well-named identifiers do that
- Don't add error handling, fallbacks, or validation for scenarios that can't happen
- Don't add features or abstractions beyond what the task asks for
- Prefer editing existing files over creating new ones

## Tailwind CSS conventions

- **Avoid raw pixel values** in arbitrary brackets — no `px-[10px]`, `w-[200px]`, `mt-[14px]`, etc.
- Use Tailwind's built-in spacing/sizing scale instead: `px-2.5`, `w-48`, `mt-3`, `gap-7`, etc.
- Arbitrary values are allowed only when the design token genuinely has no Tailwind equivalent (e.g. `max-w-[1360px]` for a custom container width, or `#5CD068` accent that lives in `globals.css`)
- Prefer `clamp()` or responsive variants (`sm:`, `md:`) over one-off pixel breakpoints

## Architecture rules

- **Config from env vars only** — never hardcode `localhost` or any URL
- Use `API_URL` for server-side fetches (server components, route handlers)
- Use `NEXT_PUBLIC_API_URL` for browser-side fetches
- Server components forward the session cookie to the API for SSR of protected pages
- Browser calls to the API must use `credentials: "include"`

## Security rules (non-negotiable)

- **Never store auth tokens in `localStorage`** — session is managed via httpOnly cookies only
- **Sanitize all user-generated HTML** before rendering (DOMPurify or equivalent)
- **CSP header** must be configured before shipping any page that renders user content
- **Ownership is enforced by the API** — hiding a button in the UI is not access control
- **Uploaded files must be served from a separate domain/bucket** (Cloudflare R2)
- Flag any code pattern that could introduce XSS or OWASP Top 10 vulnerabilities

## Auth flow (do not deviate)

1. Go API sets `httpOnly`, `Secure`, `SameSite=Lax` cookie scoped to `.example.com`
2. Server components read the incoming cookie and forward it to the API
3. Client components fetch with `credentials: "include"` — no manual token handling
4. No token in `localStorage`, `sessionStorage`, or JS-readable cookies

## Environment variables

| Variable | Scope | Example (local) |
|----------|-------|-----------------|
| `API_URL` | Server-side only | `http://localhost:8080` |
| `NEXT_PUBLIC_API_URL` | Browser | `http://localhost:8080` |
| `SITE_URL` | Server-side | `http://localhost:3000` |

## Testing

- Tests live in `tests/` (Playwright)
- Write E2E tests for critical user flows: auth, creating/editing content, public page rendering
- Do not mock the API in E2E tests — tests should hit a real local or staging backend

## Definition of done

- `pnpm lint` passes with no errors
- `pnpm build` succeeds
- For UI changes: verify the feature works in a browser, test the golden path and edge cases
- For auth-related changes: confirm the cookie flow still works end-to-end
