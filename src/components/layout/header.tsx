"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { MOCK_CATEGORIES, MOCK_PLATFORMS } from "@/lib/mock-data";
import MobileSidebar from "@/components/layout/mobile-sidebar";

export default function Header() {
  const [catsOpen, setCatsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const catsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (catsRef.current && !catsRef.current.contains(e.target as Node)) {
        setCatsOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  const totalGames = MOCK_CATEGORIES.reduce((sum, c) => sum + c.count, 0);

  return (
    <>
      <header className="border-b border-border bg-bg sticky top-0 z-30">
        <div className="max-w-340 mx-auto px-4 sm:px-6 lg:px-10 py-3.5 flex items-center gap-x-7">

          {/* Logo */}
          <Link
            href="/"
            aria-label="SugarCane home"
            className="flex items-center gap-2.5 text-text shrink-0"
          >
            <SugarCaneIcon className="size-7.5" />
            <span className="font-display font-extrabold text-2xl tracking-tight">SugarCane</span>
          </Link>

          {/* Desktop nav — hidden on mobile */}
          <nav aria-label="Main" className="hidden lg:flex flex-wrap items-center gap-x-5.5 gap-y-1 font-semibold text-nav">

            {/* Categories dropdown */}
            <div className="relative" ref={catsRef}>
              <button
                type="button"
                onClick={() => setCatsOpen((v) => !v)}
                aria-expanded={catsOpen}
                aria-haspopup="true"
                className="h-11 px-1 bg-transparent border-0 text-muted hover:text-text text-nav font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                Categories
                <ChevronDownIcon
                  className={`size-3.5 transition-transform duration-150 ${catsOpen ? "rotate-180" : ""}`}
                />
              </button>

              {catsOpen && (
                <div className="absolute left-0 top-12 z-30 w-96 max-w-[calc(100vw-2rem)] bg-bg border border-border rounded-2xl shadow-xl p-2.5">
                  <Link
                    href="/browse"
                    onClick={() => setCatsOpen(false)}
                    className="flex justify-between items-center p-3 rounded-xl text-text font-bold border-b border-border"
                  >
                    All games
                    <span className="text-muted font-semibold text-sm">{totalGames}</span>
                  </Link>

                  <span className="block px-3 pt-3 pb-1 text-muted text-xs font-bold tracking-widest uppercase">
                    Genre
                  </span>
                  <div className="grid grid-cols-2 gap-0.5">
                    {MOCK_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/browse?genre=${cat.slug}`}
                        onClick={() => setCatsOpen(false)}
                        className="flex justify-between items-center px-3 py-2.5 rounded-xl text-text text-nav font-semibold hover:bg-surface transition-colors"
                      >
                        {cat.label}
                        <span className="text-muted text-xs">{cat.count}</span>
                      </Link>
                    ))}
                  </div>

                  <span className="block mt-1.5 px-3 pt-3 pb-1 border-t border-border text-muted text-xs font-bold tracking-widest uppercase">
                    Platform
                  </span>
                  <div className="grid grid-cols-2 gap-0.5">
                    {MOCK_PLATFORMS.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/browse?platform=${p.slug}`}
                        onClick={() => setCatsOpen(false)}
                        className="flex justify-between items-center px-3 py-2.5 rounded-xl text-text text-nav font-semibold hover:bg-surface transition-colors"
                      >
                        {p.label}
                        <span className="text-muted text-xs">{p.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/games/new" className="text-muted hover:text-text transition-colors">
              Create New Game
            </Link>
          </nav>

          {/* Desktop search — hidden on mobile */}
          <div className="hidden lg:block flex-1 max-w-100">
            <form role="search" action="/browse" className="flex items-center gap-2.5 bg-surface border border-border rounded-full pl-4 pr-1.5 h-11">
              <SearchIcon className="size-4.5 text-muted shrink-0" />
              <label htmlFor="header-search" className="sr-only">Search games by name</label>
              <input
                id="header-search"
                name="q"
                type="search"
                autoComplete="off"
                placeholder="Search games"
                className="flex-1 min-w-0 bg-transparent border-0 outline-none text-text text-nav placeholder:text-muted"
              />
            </form>
          </div>

          {/* Desktop right — hidden on mobile */}
          <div className="hidden lg:flex items-center gap-3 ml-auto">
            <Link
              href="/my-list"
              className="text-text text-nav font-semibold border border-border-strong rounded-full pl-4 pr-2 h-11 inline-flex items-center gap-2 hover:bg-surface transition-colors"
            >
              <BookmarkIcon className="size-4.5" />
              My list
              <span className="min-w-7 h-7 px-2 rounded-full bg-surface text-xs font-bold inline-flex items-center justify-center">
                0
              </span>
            </Link>

            <Link
              href="/login"
              className="bg-accent text-text font-bold text-nav rounded-full px-5 h-11 inline-flex items-center hover:opacity-90 transition-opacity"
            >
              Log in
            </Link>
          </div>

          {/* Mobile hamburger — visible only on mobile */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={sidebarOpen}
            className="lg:hidden ml-auto size-10 flex items-center justify-center rounded-full hover:bg-surface transition-colors cursor-pointer"
          >
            <HamburgerIcon className="size-5 text-text" />
          </button>

        </div>
      </header>

      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

function SugarCaneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="9" y="3" width="6" height="26" rx="3" fill="#5CD068" />
      <rect x="18" y="8" width="6" height="21" rx="3" fill="#5CD068" opacity="0.55" />
      <path d="M9 11h6M9 19h6M18 16h6" stroke="#FFFFFF" strokeWidth="2" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
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

function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
