"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FolderPlus, Server } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { ServerCard } from "@/components/servers/server-card"

import { IPTVServer } from "@/types"
import { Storage } from "@/lib/storage"

export default function ServersPage() {
  const [servers, setServers] = useState<IPTVServer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Fetch servers from storage
  useEffect(() => {
    const loadServers = () => {
      try {
        const storedServers = Storage.getServers()
        setServers(storedServers)
      } catch (error) {
        console.error("Error loading servers:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadServers()
    
    // Add event listener for storage changes
    const handleStorageChange = () => {
      loadServers()
    }
    
    window.addEventListener("storage", handleStorageChange)
    
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">IPTV Servers</h1>
          <p className="text-muted-foreground">
            Manage your IPTV server connections
          </p>
        </div>
        <Button asChild>
          <Link href="/servers/add">
            <FolderPlus className="h-4 w-4 mr-2" />
            Add Server
          </Link>
        </Button>
      </div>
      
      {isLoading ? (
        <p className="text-muted-foreground">Loading servers...</p>
      ) : servers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {servers.map((server) => (
            <ServerCard 
              key={server.id} 
              server={server} 
              onDelete={() => {
                setServers(prev => prev.filter(s => s.id !== server.id))
              }}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Server className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Servers Found</h3>
            <p className="text-muted-foreground text-center mb-6">
              You haven't added any IPTV servers yet.
              <br />
              Add your first server to get started.
            </p>
            <Button asChild>
              <Link href="/servers/add">
                <FolderPlus className="h-4 w-4 mr-2" />
                Add Your First Server
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}