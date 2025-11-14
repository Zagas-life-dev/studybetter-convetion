"use client"

import Link from "next/link"
import { Trash2, FileText, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { format } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ResponseCardProps {
  response: {
    id: string
    title: string
    task_type: string
    original_filename: string | null
    created_at: string
  }
  onDelete: (id: string) => void
}

export function ResponseCard({ response, onDelete }: ResponseCardProps) {
  return (
    <Card className="p-6 border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 rounded-2xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link href={`/dashboard/responses/${response.id}`}>
            <h3 className="text-xl font-black text-black mb-2 hover:text-purple-600 transition-colors">
              {response.title}
            </h3>
          </Link>
          {response.original_filename && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <FileText className="w-4 h-4" />
              <span className="truncate">{response.original_filename}</span>
            </div>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(response.created_at), "MMM d, yyyy")}</span>
            </div>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold capitalize">
              {response.task_type}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Link href={`/dashboard/responses/${response.id}`} className="flex-1">
          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold">
            View
          </Button>
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="icon" className="border-red-300 text-red-600 hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Resource?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this resource? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(response.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  )
}


