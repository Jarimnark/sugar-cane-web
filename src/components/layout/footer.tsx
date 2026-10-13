import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-16">
      <div className="max-w-340 mx-auto px-4 sm:px-6 lg:px-10 pt-8 pb-10 flex flex-wrap justify-between items-center gap-5">

        {/* Brand block */}
        <div className="flex flex-col gap-1.5">
          <span className="font-display font-extrabold text-xl text-text">SugarCane</span>
          <span className="text-muted text-sm">A shelf of web games, picked by players.</span>
          <span className="inline-flex items-center gap-2 text-muted text-sm">
            <MailIcon className="size-4 shrink-0" />
            Contact:{" "}
            <a href="mailto:hello@sugarcane.example" className="font-bold text-text hover:underline">
              hello@sugarcane.example
            </a>
          </span>
        </div>

        {/* Footer nav */}
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-text">
          <Link href="/games/new" className="hover:text-muted transition-colors">Create New Game</Link>
          <Link href="/about" className="hover:text-muted transition-colors">About</Link>
        </nav>

      </div>
    </footer>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}
