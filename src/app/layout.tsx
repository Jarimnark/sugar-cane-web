import type { Metadata } from "next";
import { Figtree, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
});

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: { default: "SugarCane", template: "%s — SugarCane" },
  description: "A web-game shelf where you manage and share your game collection.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${figtree.className} ${bricolageGrotesque.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
