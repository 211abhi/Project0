"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = ["Communities", "Maps", "Lectures", "SAC"];
  const navMap: Record<string, string> = {
    Communities: "/dashboard",
    Maps: "/dashboard/map",
    Lectures: "/dashboard/study",
    SAC: "/dashboard/sac-permission",
  };

  return (
    <nav className="hidden md:block fixed left-4 top-24 z-50 w-44">
      {/* top-left home button */}
      <div className="mb-3">
        <button
          onClick={() => router.push('/')}
          className="w-full rounded-md px-3 py-2 text-left text-sm font-medium bg-white/60 dark:bg-neutral-900/60 border"
          aria-label="Go to Home"
        >
          Home
        </button>
      </div>
      <div className="space-y-2">
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => router.push(navMap[item])}
            className={`w-full text-left rounded-md px-3 py-2 text-sm font-medium transition-colors ${pathname === navMap[item] ? 'bg-neutral-100 dark:bg-neutral-800' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
            aria-label={`Navigate to ${item}`}
          >
            {item}
          </button>
        ))}
      </div>
    </nav>
  );
}