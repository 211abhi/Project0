import { ReactNode } from "react"
import { DashboardNav } from "@/components/ui/navbar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b bg-white/60 dark:bg-black/40">
        <div className="max-w-6xl mx-auto p-4">
          <DashboardNav />
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </div>
  )
}
