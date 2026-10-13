"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import Select from "@/components/ui/select";

const SORT_OPTIONS = [
  { value: "added", label: "Recently added" },
  { value: "name", label: "Name (A–Z)" },
];

export default function SortSelect({ value }: { value: "added" | "name" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function onChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "added") params.delete("sort");
    else params.set("sort", next);
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/my-list?${qs}` : "/my-list");
    });
  }

  return (
    <div className="w-full sm:w-56">
      <Select
        options={SORT_OPTIONS}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={pending}
        aria-label="Sort my list"
      />
    </div>
  );
}
