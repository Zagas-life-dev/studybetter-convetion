"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, Trash2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface SavedResponse {
  id: string
  title: string
  markdown_content: string
  task_type: string
  created_at: string
}

interface ResourceCardProps {
  response: SavedResponse
  onDelete: (id: string) => void
}

export function ResourceCard({ response, onDelete }: ResourceCardProps) {
  const { toast } = useToast()

  const handleDelete = async () => {
    try {
      await onDelete(response.id)
      toast({
        title: "Resource Deleted",
        description: "The resource has been successfully deleted.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the resource. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getTruncatedContent = (content: string, wordLimit: number) => {
    const words = content.split(" ")
    if (words.length <= wordLimit) {
      return content
    }
    return words.slice(0, wordLimit).join(" ") + "..."
  }

  return (
    <Card className="p-6 border-2 border-purple-100 rounded-2xl hover:border-purple-300 hover:shadow-lg transition-all group">
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black">{response.title}</h3>
                <Badge variant="outline" className="capitalize mt-1">
                  {response.task_type}
                </Badge>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4 h-12 overflow-hidden">
            {getTruncatedContent(response.markdown_content, 20)}
          </p>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-500 hover:bg-red-50">
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
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Link href={`/dashboard/resources/${response.id}`}>
              <Button variant="ghost" className="group-hover:text-purple-600">
                View
                <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}








