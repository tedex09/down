"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Server, 
  CheckCircle, 
  XCircle, 
  AlertCircle 
} from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useToast } from "@/hooks/use-toast"
import { IPTVServer } from "@/types"
import { cn } from "@/lib/utils"

interface ServerCardProps {
  server: IPTVServer
  onDelete?: () => void
}

export function ServerCard({ server, onDelete }: ServerCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleEdit = () => {
    router.push(`/servers/edit/${server.id}`)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/iptv/server?id=${server.id}`, {
        method: "DELETE",
      })
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || "Failed to delete server")
      }
      
      toast({
        title: "Server deleted",
        description: "The server has been removed successfully",
      })
      
      if (onDelete) {
        onDelete()
      }
      
      router.refresh()
    } catch (error) {
      console.error("Error deleting server:", error)
      toast({
        title: "Error",
        description: (error as Error).message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const statusIcon = {
    online: <CheckCircle className="h-4 w-4 text-green-500" />,
    offline: <XCircle className="h-4 w-4 text-red-500" />,
    unknown: <AlertCircle className="h-4 w-4 text-yellow-500" />,
  }

  const statusText = {
    online: "Online",
    offline: "Offline",
    unknown: "Unknown",
  }

  return (
    <>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-semibold">{server.name}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground flex items-center">
              <Server className="mr-2 h-4 w-4" />
              {server.url}
            </p>
            <div className="flex items-center gap-2">
              <span 
                className={cn(
                  "flex items-center px-2 py-1 rounded text-xs font-medium",
                  server.status === "online" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                  server.status === "offline" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
                  server.status === "unknown" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                )}
              >
                {statusIcon[server.status || "unknown"]}
                <span className="ml-1">{statusText[server.status || "unknown"]}</span>
              </span>
              
              {server.lastChecked && (
                <span className="text-xs text-muted-foreground">
                  Last checked: {format(new Date(server.lastChecked), "MMM d, yyyy")}
                </span>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            onClick={() => router.push(`/movies?serverId=${server.id}`)}
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            Browse Content
          </Button>
        </CardFooter>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the server "{server.name}" and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}