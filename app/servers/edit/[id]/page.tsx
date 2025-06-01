"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ServerForm } from "@/components/servers/server-form"

import { IPTVServer } from "@/types"
import { Storage } from "@/lib/storage"

export default function EditServerPage({ params }: { params: { id: string } }) {
  const [server, setServer] = useState<IPTVServer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  
  useEffect(() => {
    try {
      const foundServer = Storage.getServer(params.id)
      
      if (foundServer) {
        setServer(foundServer)
      } else {
        setError("Server not found")
      }
    } catch (err) {
      console.error("Error loading server:", err)
      setError("Failed to load server details")
    } finally {
      setIsLoading(false)
    }
  }, [params.id])
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  if (error || !server) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href="/servers">
              <ChevronLeft className="h-4 w-4" />
              Back to Servers
            </Link>
          </Button>
        </div>
        
        <div className="p-12 text-center">
          <h3 className="text-xl font-medium mb-2">Error</h3>
          <p className="text-muted-foreground mb-4">{error || "Server not found"}</p>
          <Button asChild>
            <Link href="/servers">Return to Servers</Link>
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link href="/servers">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold">Edit Server</h1>
        <p className="text-muted-foreground">
          Update your IPTV server configuration
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Server Details</CardTitle>
          <CardDescription>
            Update your Xtream Codes IPTV server credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServerForm 
            server={server}
            onSuccess={() => router.push("/servers")}
          />
        </CardContent>
      </Card>
    </div>
  )
}