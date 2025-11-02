"use client"

import Link from "next/link"

export function DashboardNav() {
  return (
    <nav>
      <ul className="flex flex-wrap items-center gap-4 text-sm">
        <li>
          <Link href="/dashboard" className="px-3 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800">Dashboard</Link>
        </li>
        <li>
          <Link href="/dashboard/recent-post" className="px-3 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800">Recent Post</Link>
        </li>
        <li>
          <Link href="/dashboard/sac-permission" className="px-3 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800">SAC Permission</Link>
        </li>
        <li>
          <Link href="/dashboard/opportunities" className="px-3 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800">Opportunities</Link>
        </li>
        <li>
          <Link href="/dashboard/map" className="px-3 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800">Map</Link>
        </li>
        <li>
          <Link href="/dashboard/study" className="px-3 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800">Study</Link>
        </li>
      </ul>
    </nav>
  )
}
