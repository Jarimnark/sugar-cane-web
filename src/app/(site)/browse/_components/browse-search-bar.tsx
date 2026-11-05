"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

interface Props {
  title: string;
}

export default function BrowseSearchBar({ title }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("q") ?? "";
  const [value, setValue] = useState(current);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setValue(current);
  }, [current]);

  function commit(next: string) {
    const trimmed = next.trim();
    if (trimmed === current) return;
    const search = new URLSearchParams(params.toString());
    if (trimmed) search.set("q", trimmed);
    else search.delete("q");
    search.delete("page");
    startTransition(() => {
      router.push(`/browse${search.toString() ? `?${search.toString()}` : ""}`, { scroll: false });
    });
  }

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        commit(value);
      }}
      className={`flex-1 min-w-56 flex items-center gap-2.5 bg-surface border border-border rounded-full pl-4 pr-2 h-11 ${pending ? "opacity-70" : ""} transition-opacity`}
    >
      <SearchIcon className="size-4.5 text-muted shrink-0" />
      <label htmlFor="browse-q" className="sr-only">Search within {title}</label>
      <input
        id="browse-q"
        name="q"
        type="search"
        autoComplete="off"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => commit(value)}
        placeholder={`Search in ${title}`}
        className="flex-1 min-w-0 bg-transparent border-0 outline-none text-text text-nav placeholder:text-muted"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setValue("");
            commit("");
          }}
          className="size-7 inline-flex items-center justify-center rounded-full text-muted hover:text-text hover:bg-bg transition-colors cursor-pointer"
        >
          <CloseIcon className="size-3.5" />
        </button>
      )}
    </form>
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

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
