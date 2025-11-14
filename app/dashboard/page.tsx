import { ResourcesList } from "@/components/dashboard/resources-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-black mb-1">My Resources</h1>
          <p className="text-sm sm:text-base text-gray-600">View and manage your saved AI resources.</p>
        </div>
        <Link href="/dashboard/new" className="w-full sm:w-auto">
          <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base shadow-lg hover:shadow-xl transition-all rounded-xl w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Create New Resource</span>
            <span className="sm:hidden">Create New</span>
          </Button>
        </Link>
      </div>

      <ResourcesList />
    </div>
  )
}


