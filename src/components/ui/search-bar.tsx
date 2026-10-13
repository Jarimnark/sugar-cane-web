"use client";

import { useEffect, useRef, useState } from "react";
import { browserApi } from "@/lib/api";

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
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
        setItems(data);
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

  function pickSuggestion(name: string) {
    setQ(name);
    setOpen(false);
    requestAnimationFrame(() => formRef.current?.requestSubmit());
  }

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <form
        ref={formRef}
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
          {items.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => pickSuggestion(name)}
              className="w-full text-left flex items-center gap-3 px-3 py-2 mx-1 rounded-xl hover:bg-surface transition-colors cursor-pointer"
            >
              <SearchIcon className="size-4 text-muted shrink-0" />
              <span className="text-sm font-semibold text-text truncate">{name}</span>
            </button>
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
