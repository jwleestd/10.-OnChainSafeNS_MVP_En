"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, ListChecks, Table2 } from "lucide-react";

import { cn } from "@/lib/utils";

const primaryLinks = [
  { href: "/playboard", label: "Status", icon: LayoutDashboard },
  { href: "/playboard/plan", label: "Plan", icon: ListChecks },
  { href: "/playboard/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/playboard/implement-summary", label: "Matrix", icon: Table2 },
];

function isActive(pathname: string, href: string) {
  if (href === "/playboard") {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

export function PlayBoardNav() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/playboard" className="text-sm font-semibold tracking-normal">
            PlayBoard
          </Link>
          <nav className="flex flex-wrap gap-1" aria-label="PlayBoard sections">
            {primaryLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                    active && "bg-accent text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="text-xs text-muted-foreground">
          {segments.map((segment, index) => (
            <span key={`${segment}-${index}`}>
              {index > 0 && <span className="px-2">/</span>}
              <span className={index === segments.length - 1 ? "font-medium text-foreground" : ""}>{segment}</span>
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}

