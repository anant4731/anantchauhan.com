"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav } from "@/content/site";

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="no-print fixed inset-x-0 top-0 z-40 px-4 pt-4 sm:px-6">
      <nav
        aria-label="Main"
        className="panel mx-auto flex max-w-5xl items-center justify-between rounded-full py-2 pr-2 pl-4"
      >
        <Link href="/" className="group flex items-center gap-2 font-mono text-sm tracking-tight">
          <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-[11px] font-bold text-black transition-transform group-hover:rotate-[20deg]">
            AC
          </span>
          <span className="hidden sm:inline">anantchauhan</span>
        </Link>
        <ul className="flex items-center gap-1 text-sm">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-3 py-1.5 transition-colors ${
                    active ? "bg-white/10 text-foreground" : "text-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
