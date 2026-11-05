"use client";

import { useId, type ReactNode } from "react";

export interface TabItem {
  value: string;
  label: string;
}

interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  items: TabItem[];
  children: ReactNode;
  ariaLabel?: string;
}

export default function Tabs({ value, onChange, items, children, ariaLabel }: TabsProps) {
  const baseId = useId();

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex flex-wrap gap-2 border-b border-border pb-2 sm:gap-1 sm:border-0 sm:pb-0"
      >
        {items.map((item) => {
          const active = item.value === value;
          return (
            <button
              key={item.value}
              id={`${baseId}-tab-${item.value}`}
              role="tab"
              type="button"
              aria-selected={active}
              aria-controls={`${baseId}-panel-${item.value}`}
              onClick={() => onChange(item.value)}
              className={[
                "rounded-full px-4 py-2 text-nav font-semibold transition-colors cursor-pointer",
                active
                  ? "bg-accent text-text"
                  : "bg-transparent text-muted hover:bg-surface hover:text-text",
              ].join(" ")}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div
        id={`${baseId}-panel-${value}`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${value}`}
      >
        {children}
      </div>
    </div>
  );
}
