"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import Select from "@/components/ui/select";

type SortValue = "popular" | "newest" | "az";

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest" },
  { value: "az", label: "A–Z" },
];

export default function SortDropdown() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const current = (params.get("sort") as SortValue | null) ?? "popular";

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
    <div className={`w-48 ${pending ? "opacity-70" : ""} transition-opacity`}>
      <label htmlFor="browse-sort" className="sr-only">
        Sort
      </label>
      <Select
        id="browse-sort"
        value={current}
        onChange={(e) => onChange(e.target.value)}
        options={SORT_OPTIONS}
      />
    </div>
  );
}
