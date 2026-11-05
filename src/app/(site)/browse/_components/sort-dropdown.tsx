"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import Select from "@/components/ui/select";
import type { GameSort } from "@/types/api";

const SORT_OPTIONS: { value: GameSort; label: string }[] = [
  { value: "popular", label: "Popularity" },
  { value: "most_liked", label: "Most liked" },
  { value: "newest", label: "Newest" },
];

export default function SortDropdown() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const current = (params.get("sort") as GameSort | null) ?? "popular";

  function onChange(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "popular") next.delete("sort");
    else next.set("sort", value);
    next.delete("page");
    startTransition(() => {
      router.push(`/browse${next.toString() ? `?${next.toString()}` : ""}`, { scroll: false });
    });
  }

  return (
    <div className={`flex flex-col gap-1.5 ${pending ? "opacity-70" : ""} transition-opacity`}>
      <label htmlFor="browse-sort" className="text-xs font-semibold text-muted">
        Sort by
      </label>
      <div className="w-44">
        <Select
          id="browse-sort"
          value={current}
          onChange={(e) => onChange(e.target.value)}
          options={SORT_OPTIONS}
        />
      </div>
    </div>
  );
}
