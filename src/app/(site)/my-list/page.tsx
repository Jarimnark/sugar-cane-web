import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My List",
};

export default function MyListPage() {
  return (
    <div className="max-w-340 mx-auto px-4 sm:px-6 lg:px-10 py-10">
      <h1 className="font-display font-extrabold text-3xl tracking-tight text-text mb-8">
        My list
      </h1>
      <p className="text-muted">Your saved games will appear here.</p>
    </div>
  );
}
