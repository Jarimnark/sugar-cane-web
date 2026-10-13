"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { browserApi } from "@/lib/api";
import type { SuggestResponse } from "@/types/api";

interface SearchBarProps {
  placeholder?: string;
  action?: string;
  className?: string;
}

export default function SearchBar({
  placeholder = "Search games",
  action = "/browse",
  className = "",
}: SearchBarProps) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SuggestResponse["items"]>([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setItems([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await browserApi.suggestGames(term, controller.signal);
        setItems(data.items);
        setOpen(true);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [q]);

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <form
        role="search"
        action={action}
        className="flex items-center gap-2.5 bg-surface border border-border rounded-full pl-4 pr-1.5 h-11"
      >
        <SearchIcon className="size-4.5 text-muted shrink-0" />
        <label htmlFor="header-search" className="sr-only">
          Search games by name
        </label>
        <input
          id="header-search"
          name="q"
          type="search"
          autoComplete="off"
          placeholder={placeholder}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => items.length > 0 && setOpen(true)}
          className="flex-1 min-w-0 bg-transparent border-0 outline-none text-text text-nav placeholder:text-muted"
        />
      </form>

      {open && (items.length > 0 || loading) && (
        <div className="absolute left-0 right-0 top-12 z-40 bg-bg border border-border rounded-2xl shadow-xl py-2 max-h-96 overflow-auto">
          {loading && items.length === 0 && (
            <div className="px-4 py-2 text-sm text-muted">Searching…</div>
          )}
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/games/${item.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 mx-1 rounded-xl hover:bg-surface transition-colors"
            >
              <span
                aria-hidden="true"
                className="size-9 rounded-lg shrink-0"
                style={{ background: item.bg }}
              />
              <span className="text-sm font-semibold text-text truncate">{item.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
