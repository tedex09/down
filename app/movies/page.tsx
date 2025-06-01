"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MovieGrid } from "@/components/movies/movie-grid"

import { Category, IPTVServer, Movie } from "@/types"
import { Storage } from "@/lib/storage"

export default function MoviesPage() {
  const searchParams = useSearchParams()
  const serverIdParam = searchParams.get("serverId")
  
  const [servers, setServers] = useState<IPTVServer[]>([])
  const [selectedServerId, setSelectedServerId] = useState<string>(serverIdParam || "")
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Load servers from storage
  useEffect(() => {
    const storedServers = Storage.getServers()
    setServers(storedServers)
    
    // If a server ID is in the URL and it exists, use it
    if (serverIdParam && storedServers.some(s => s.id === serverIdParam)) {
      setSelectedServerId(serverIdParam)
    } else if (storedServers.length > 0) {
      // Otherwise use the first server if available
      setSelectedServerId(storedServers[0].id)
    }
  }, [serverIdParam])
  
  // Load categories when server changes
  useEffect(() => {
    if (!selectedServerId) return
    
    const fetchCategories = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/iptv/categories?serverId=${selectedServerId}`)
        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch categories")
        }
        
        setCategories(data.data)
      } catch (error) {
        console.error("Error fetching categories:", error)
        setError((error as Error).message || "Failed to load categories")
        setCategories([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCategories()
  }, [selectedServerId])
  
  // Load movies when server or category changes
  useEffect(() => {
    if (!selectedServerId) return
    
    const fetchMovies = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const url = `/api/iptv/movies?serverId=${selectedServerId}${
          selectedCategoryId ? `&categoryId=${selectedCategoryId}` : ""
        }`
        
        const response = await fetch(url)
        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch movies")
        }
        
        setMovies(data.data)
      } catch (error) {
        console.error("Error fetching movies:", error)
        setError((error as Error).message || "Failed to load movies")
        setMovies([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchMovies()
  }, [selectedServerId, selectedCategoryId])
  
  const selectedServer = servers.find(s => s.id === selectedServerId)
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Movies</h1>
          <p className="text-muted-foreground">
            Browse movies from your IPTV servers
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedServerId} onValueChange={setSelectedServerId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a server" />
            </SelectTrigger>
            <SelectContent>
              {servers.map((server) => (
                <SelectItem key={server.id} value={server.id}>
                  {server.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={selectedCategoryId} 
            onValueChange={setSelectedCategoryId}
            disabled={!selectedServerId || categories.length === 0}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {!selectedServerId ? (
        <div className="py-12 text-center">
          <h3 className="text-xl font-medium mb-2">No Server Selected</h3>
          <p className="text-muted-foreground mb-4">
            Please select a server to browse movies
          </p>
          {servers.length === 0 ? (
            <Button asChild>
              <Link href="/servers/add">Add Your First Server</Link>
            </Button>
          ) : null}
        </div>
      ) : error ? (
        <div className="py-12 text-center">
          <h3 className="text-xl font-medium mb-2">Error</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      ) : (
        <MovieGrid 
          movies={movies} 
          serverId={selectedServerId}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}