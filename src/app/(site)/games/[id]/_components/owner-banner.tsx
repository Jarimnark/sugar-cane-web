"use client";

import Link from "next/link";
import { useSession } from "@/hooks/useSession";

interface OwnerBannerProps {
  ownerId: string;
  gameId: string;
  status: "draft" | "published";
}

export default function OwnerBanner({ ownerId, gameId, status }: OwnerBannerProps) {
  const { user } = useSession();
  if (!user || user.id !== ownerId) return null;

  return (
    <div className="bg-[#F2FAF3] border-b border-[#CDEBD2]">
      <div className="max-w-340 mx-auto px-4 sm:px-6 lg:px-10 py-2.5 flex flex-wrap items-center gap-3 text-[15px]">
        <span className="bg-[#DCEFE3] text-[#14541F] text-xs font-bold px-2.5 py-1 rounded-full capitalize">
          {status}
        </span>
        <span className="flex-1 font-semibold text-text min-w-[200px]">
          You own this game page. Players see it exactly like this.
        </span>
        <Link
          href={`/games/mine/${gameId}/edit`}
          className="h-10 px-4 rounded-full bg-text text-bg font-bold text-sm inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <EditIcon className="size-3.5" />
          Edit page
        </Link>
      </div>
    </div>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}
