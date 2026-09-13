"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "▣" },
  { href: "/customers", label: "Customers", icon: "☺" },
  { href: "/jobs", label: "Jobs", icon: "⚒" },
  { href: "/estimates", label: "Estimates", icon: "▤" },
  { href: "/invoices", label: "Invoices", icon: "$" },
  { href: "/schedule", label: "Schedule", icon: "◔" },
  { href: "/materials", label: "Materials", icon: "▦" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="no-print flex w-full shrink-0 flex-col bg-[var(--sidebar-bg)] text-[var(--sidebar-fg)] md:h-screen md:w-60 md:sticky md:top-0">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-brand text-white font-bold">
          H
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-sm">Holliday Welding</div>
          <div className="text-xs text-white/50">&amp; Fence CRM</div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4 overflow-x-auto md:overflow-visible">
        <div className="flex gap-1 md:flex-col md:gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="w-4 text-center">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="px-5 py-4 text-xs text-white/40 border-t border-white/10 hidden md:block">
        Holliday Welding &amp; Fence CRM
      </div>
    </aside>
  );
}
