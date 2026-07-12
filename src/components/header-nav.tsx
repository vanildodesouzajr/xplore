"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeaderNav({
  labels,
}: {
  labels: { dashboard: string; games: string };
}) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: labels.dashboard, icon: LayoutGrid },
    { href: "/games", label: labels.games, icon: Gamepad2 },
  ];

  return (
    <nav className="flex items-center gap-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
