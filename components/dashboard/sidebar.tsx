"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, MessageSquare, BookOpen, HelpCircle, Settings, LogOut, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: FileText },
  { href: "/dashboard/new", label: "Create New", icon: Plus },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare, comingSoon: true },
  { href: "/dashboard/flashcards", label: "Flashcards", icon: BookOpen },
  { href: "/dashboard/quizlet", label: "Quizlet", icon: HelpCircle, comingSoon: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    })
    router.push("/")
    router.refresh()
  }

  return (
    <aside className="w-64 bg-white border-r-2 border-purple-100 h-full flex-col hidden md:flex flex-shrink-0">
      <div className="p-6 border-b border-purple-100 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-xl font-black text-black leading-none">Study Better</div>
            <div className="text-xs font-bold text-purple-600 uppercase tracking-wider">AI</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden min-h-0">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href === "/dashboard" && pathname.startsWith("/dashboard/resources")) || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.comingSoon ? "#" : item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all",
                isActive
                  ? "bg-purple-600 text-white"
                  : "text-gray-700 hover:bg-purple-50 hover:text-purple-600",
                item.comingSoon && "opacity-60 cursor-not-allowed"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.comingSoon && (
                <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  Coming Soon
                </span>
              )}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 border-t border-purple-100 space-y-2 flex-shrink-0">
        <Link
          href="/dashboard/profile"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all",
            pathname === "/dashboard/profile"
              ? "bg-purple-600 text-white"
              : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
          )}
        >
          <Settings className="w-5 h-5" />
          <span>Profile</span>
        </Link>
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </aside>
  )
}


