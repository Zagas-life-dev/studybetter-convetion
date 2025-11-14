"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, MessageSquare, BookOpen, HelpCircle, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Home", icon: FileText },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare, comingSoon: true },
  { href: "/dashboard/new", label: "Create", icon: Plus, isCenter: true },
  { href: "/dashboard/flashcards", label: "Flashcards", icon: BookOpen, comingSoon: true },
  { href: "/dashboard/quizlet", label: "Quizlet", icon: HelpCircle, comingSoon: true },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-purple-100 md:hidden safe-area-bottom">
      <div className="flex items-end justify-around px-2 pb-2 pt-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = 
            pathname === item.href || 
            (item.href === "/dashboard" && pathname.startsWith("/dashboard/resources")) ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          
          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-center rounded-full bg-purple-600 text-white shadow-lg transition-all hover:bg-purple-700 active:scale-95",
                  "w-14 h-14 -mt-6"
                )}
              >
                <Icon className="w-6 h-6" />
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.comingSoon ? "#" : item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-lg transition-all min-w-[60px]",
                isActive
                  ? "text-purple-600 bg-purple-50"
                  : "text-gray-600 hover:text-purple-600",
                item.comingSoon && "opacity-60 cursor-not-allowed"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-semibold leading-tight">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

