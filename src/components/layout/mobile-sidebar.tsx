"use client";

import Link from "next/link";
import { useEffect } from "react";
import { MOCK_CATEGORIES, MOCK_PLATFORMS } from "@/lib/mock-data";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const totalGames = MOCK_CATEGORIES.reduce((sum, c) => sum + c.count, 0);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 bg-text/20 z-40 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed top-0 left-0 h-full w-80 bg-bg z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header row */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
          <Link
            href="/"
            onClick={onClose}
            className="font-display font-extrabold text-xl tracking-tight text-text"
          >
            SugarCane
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="size-9 flex items-center justify-center rounded-full hover:bg-surface transition-colors cursor-pointer"
          >
            <XIcon className="size-5 text-text" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-5 flex flex-col gap-6">

            {/* Search */}
            <form
              role="search"
              action="/browse"
              onSubmit={onClose}
              className="flex items-center gap-2.5 bg-surface border border-border rounded-full pl-4 pr-1.5 h-11"
            >
              <SearchIcon className="size-4.5 text-muted shrink-0" />
              <label htmlFor="mobile-search" className="sr-only">Search games by name</label>
              <input
                id="mobile-search"
                name="q"
                type="search"
                autoComplete="off"
                placeholder="Search games"
                className="flex-1 min-w-0 bg-transparent border-0 outline-none text-text text-nav placeholder:text-muted"
              />
            </form>

            {/* Browse */}
            <div>
              <Link
                href="/browse"
                onClick={onClose}
                className="flex justify-between items-center py-2.5 border-b border-border text-text text-nav font-bold"
              >
                All games
                <span className="text-muted text-sm font-semibold">{totalGames}</span>
              </Link>

              <p className="mt-4 mb-1.5 text-xs font-bold text-muted tracking-widest uppercase">Genre</p>
              <div className="flex flex-col">
                {MOCK_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/browse?genre=${cat.slug}`}
                    onClick={onClose}
                    className="flex justify-between items-center py-2.5 border-b border-border/50 last:border-0 text-text text-nav font-semibold"
                  >
                    {cat.label}
                    <span className="text-muted text-xs">{cat.count}</span>
                  </Link>
                ))}
              </div>

              <p className="mt-4 mb-1.5 text-xs font-bold text-muted tracking-widest uppercase">Platform</p>
              <div className="flex flex-col">
                {MOCK_PLATFORMS.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/browse?platform=${p.slug}`}
                    onClick={onClose}
                    className="flex justify-between items-center py-2.5 border-b border-border/50 last:border-0 text-text text-nav font-semibold"
                  >
                    {p.label}
                    <span className="text-muted text-xs">{p.count}</span>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Fixed bottom actions */}
        <div className="px-5 py-5 border-t border-border flex flex-col gap-3 shrink-0">
          <Link
            href="/my-list"
            onClick={onClose}
            className="flex items-center justify-between text-text text-nav font-semibold py-1"
          >
            <span className="flex items-center gap-3">
              <BookmarkIcon className="size-4.5 shrink-0" />
              My list
            </span>
            <span className="min-w-7 h-7 px-2 rounded-full bg-surface text-xs font-bold inline-flex items-center justify-center">
              0
            </span>
          </Link>

          <Link
            href="/games/new"
            onClick={onClose}
            className="flex items-center gap-3 text-text text-nav font-semibold py-1"
          >
            <PlusIcon className="size-4.5 shrink-0 text-muted" />
            Create New Game
          </Link>

          <Link
            href="/login"
            onClick={onClose}
            className="mt-1 bg-accent text-text font-bold text-nav rounded-full h-11 flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            Log in
          </Link>
        </div>
      </aside>
    </>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#FFE07A" stroke="#B58900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
