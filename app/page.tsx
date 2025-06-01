"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  BarChart3, 
  Film, 
  FolderPlus, 
  Layout, 
  Server, 
  Layers,
  Search,
  ArrowRight
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServerCard } from "@/components/servers/server-card"

import { IPTVServer } from "@/types"
import { Storage } from "@/lib/storage"

export default function Dashboard() {
  const [servers, setServers] = useState<IPTVServer[]>([])
  const [activeTab, setActiveTab] = useState("overview")
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
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">IPTV Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your IPTV servers and discover content
        </p>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="servers">
            Servers ({servers.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Servers
                </CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{servers.length}</div>
                <p className="text-xs text-muted-foreground">
                  {servers.filter(s => s.status === 'online').length} online
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recent Activity
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">
                  No recent activity
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Movies
                </CardTitle>
                <Film className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">
                  Select a server to view movies
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Categories
                </CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">
                  Select a server to view categories
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Get started with your IPTV dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Button className="h-auto flex items-start justify-start p-4 text-left" asChild>
                  <Link href="/servers/add">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <FolderPlus className="h-5 w-5" />
                        <span className="font-medium">Add Server</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Configure a new IPTV server with your credentials
                      </span>
                    </div>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-auto flex items-start justify-start p-4 text-left" asChild>
                  <Link href="/search">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <Search className="h-5 w-5" />
                        <span className="font-medium">Search Content</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Find movies and TV shows across your servers
                      </span>
                    </div>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-auto flex items-start justify-start p-4 text-left" asChild>
                  <Link href="/movies">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <Film className="h-5 w-5" />
                        <span className="font-medium">Browse Movies</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Explore all available movies from your servers
                      </span>
                    </div>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-auto flex items-start justify-start p-4 text-left" asChild>
                  <Link href="/settings">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <Layout className="h-5 w-5" />
                        <span className="font-medium">Settings</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Configure your dashboard preferences
                      </span>
                    </div>
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Servers</CardTitle>
                <CardDescription>
                  Your recently added IPTV servers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoading ? (
                  <p className="text-muted-foreground text-sm">Loading servers...</p>
                ) : servers.length > 0 ? (
                  servers.slice(0, 3).map((server) => (
                    <div 
                      key={server.id} 
                      className="flex items-center justify-between py-2 border-b last:border-0 border-border"
                    >
                      <div>
                        <p className="font-medium">{server.name}</p>
                        <p className="text-xs text-muted-foreground">{server.url}</p>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/movies?serverId=${server.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No servers added yet</p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/servers">View All Servers</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="servers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your IPTV Servers</h2>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}