"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import MobileSidebar from "@/components/layout/mobile-sidebar";
import SearchBar from "@/components/ui/search-bar";
import { browserApi } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import { MOCK_CATEGORIES, MOCK_PLATFORMS } from "@/lib/mock-data";

export default function Header() {
  const [catsOpen, setCatsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const catsRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const { user, refresh } = useSession();

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (catsRef.current && !catsRef.current.contains(e.target as Node)) {
        setCatsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  async function onLogout() {
    try {
      await browserApi.logout();
    } finally {
      setUserOpen(false);
      await refresh();
      window.location.href = "/";
    }
  }

  const totalGames = MOCK_CATEGORIES.reduce((sum, c) => sum + c.count, 0);

  return (
    <>
      <header className="border-b border-border bg-bg sticky top-0 z-30">
        <div className="max-w-340 mx-auto px-4 sm:px-6 lg:px-10 py-3.5 flex items-center gap-x-7">
          <Link
            href="/"
            aria-label="SugarCane home"
            className="flex items-center gap-2.5 text-text shrink-0"
          >
            <SugarCaneIcon className="size-7.5" />
            <span className="font-display font-extrabold text-2xl tracking-tight">SugarCane</span>
          </Link>

          <nav
            aria-label="Main"
            className="hidden lg:flex flex-wrap items-center gap-x-5.5 gap-y-1 font-semibold text-nav"
          >
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

          <div className="hidden lg:block flex-1 max-w-100">
            <SearchBar />
          </div>

          <div className="hidden lg:flex items-center gap-3 ml-auto">
            <Link
              href="/my-list"
              className="text-text text-nav font-semibold border border-border-strong rounded-full pl-4 pr-2 h-11 inline-flex items-center gap-2 hover:bg-surface transition-colors"
            >
              <BookmarkIcon className="size-4.5" />
              My list
            </Link>

            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  type="button"
                  onClick={() => setUserOpen((v) => !v)}
                  aria-expanded={userOpen}
                  aria-haspopup="true"
                  aria-label="Account menu"
                  className="size-11 rounded-full overflow-hidden border border-border-strong bg-surface flex items-center justify-center cursor-pointer hover:brightness-95 transition"
                >
                  {user.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.photo_url}
                      alt={user.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-bold text-text">
                      {user.display_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </button>

                {userOpen && (
                  <div className="absolute right-0 top-12 z-30 w-56 bg-bg border border-border rounded-2xl shadow-xl p-2">
                    <div className="px-3 py-2 border-b border-border">
                      <div className="text-sm font-bold text-text truncate">
                        {user.display_name}
                      </div>
                      <div className="text-xs text-muted truncate">{user.email}</div>
                    </div>
                    <Link
                      href="/settings"
                      onClick={() => setUserOpen(false)}
                      className="block px-3 py-2.5 rounded-xl text-text text-nav font-semibold hover:bg-surface transition-colors"
                    >
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-text text-nav font-semibold hover:bg-surface transition-colors cursor-pointer"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-accent text-text font-bold text-nav rounded-full px-5 h-11 inline-flex items-center hover:opacity-90 transition-opacity"
              >
                Log in
              </Link>
            )}
          </div>

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
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="#FFE07A"
      stroke="#B58900"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" />
    </svg>
  );
}

function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
