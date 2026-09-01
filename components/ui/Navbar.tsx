"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/",         label: "Dashboard", icon: "📊" },
  { href: "/grenades", label: "Granadas",  icon: "💨" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-surface-950/95 backdrop-blur border-b border-surface-700">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg text-white hover:text-brand-400 transition-colors"
          >
            <span className="text-brand-500 text-xl">⚡</span>
            <span>CS<span className="text-brand-500">Tracker</span></span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-brand-500/20 text-brand-400"
                    : "text-gray-400 hover:text-gray-200 hover:bg-surface-800"
                )}
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
