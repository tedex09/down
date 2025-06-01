"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

import { SearchFilters } from "@/components/search/search-filters"
import { MovieGrid } from "@/components/movies/movie-grid"

import { Movie, Category, IPTVServer } from "@/types"
import { Storage } from "@/lib/storage"

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [servers, setServers] = useState<IPTVServer[]>([])
  const [selectedServerId, setSelectedServerId] = useState<string>("")
  const [categories, setCategories] = useState<Category[]>([])
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isLoadingMovies, setIsLoadingMovies] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Load servers from storage
  useEffect(() => {
    const storedServers = Storage.getServers()
    setServers(storedServers)
    
    // Get the server ID from the URL, or use the first server
    const serverIdParam = searchParams.get("serverId")
    if (serverIdParam && storedServers.some(s => s.id === serverIdParam)) {
      setSelectedServerId(serverIdParam)
    } else if (storedServers.length > 0) {
      setSelectedServerId(storedServers[0].id)
    }
  }, [searchParams])
  
  // Load categories when server changes
  useEffect(() => {
    if (!selectedServerId) return
    
    const fetchCategories = async () => {
      setIsLoadingCategories(true)
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
        setIsLoadingCategories(false)
      }
    }
    
    fetchCategories()
  }, [selectedServerId])
  
  // Handle search
  const handleSearch = async (params: {
    query?: string
    categoryId?: string
    fromDate?: string
    sortBy?: string
    sortOrder?: string
  }) => {
    if (!selectedServerId) return
    
    setIsLoadingMovies(true)
    setError(null)
    
    try {
      // Build URL with search parameters
      const queryParams = new URLSearchParams({
        serverId: selectedServerId,
        ...(params.query && { query: params.query }),
        ...(params.categoryId && { categoryId: params.categoryId }),
        ...(params.fromDate && { fromDate: params.fromDate }),
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.sortOrder && { sortOrder: params.sortOrder }),
      })
      
      // Update URL with search parameters
      router.push(`/search?${queryParams.toString()}`)
      
      const response = await fetch(`/api/iptv/movies?${queryParams.toString()}`)
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch movies")
      }
      
      setMovies(data.data)
    } catch (error) {
      console.error("Error searching movies:", error)
      setError((error as Error).message || "Failed to search movies")
      setMovies([])
    } finally {
      setIsLoadingMovies(false)
    }
  }
  
  // Get search parameters from URL
  useEffect(() => {
    if (!selectedServerId) return
    
    const query = searchParams.get("query") || undefined
    const categoryId = searchParams.get("categoryId") || undefined
    const fromDate = searchParams.get("fromDate") || undefined
    const sortBy = searchParams.get("sortBy") || undefined
    const sortOrder = searchParams.get("sortOrder") || undefined
    
    // If any search params exist, execute the search
    if (query || categoryId || fromDate || sortBy || sortOrder) {
      handleSearch({
        query,
        categoryId,
        fromDate,
        sortBy,
        sortOrder,
      })
    }
  }, [selectedServerId, searchParams])
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground">
          Search for movies across your IPTV servers
        </p>
      </div>
      
      {servers.length === 0 ? (
        <div className="py-12 text-center">
          <h3 className="text-xl font-medium mb-2">No Servers Found</h3>
          <p className="text-muted-foreground mb-4">
            You need to add at least one server before you can search for content.
          </p>
        </div>
      ) : !selectedServerId ? (
        <div className="py-12 text-center">
          <h3 className="text-xl font-medium mb-2">Select a Server</h3>
          <p className="text-muted-foreground mb-4">
            Please select a server to search for content
          </p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <SearchFilters 
              categories={isLoadingCategories ? [] : categories}
              onSearch={handleSearch}
            />
          </div>
          
          {isLoadingMovies ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <h3 className="text-xl font-medium mb-2">Error</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
            </div>
          ) : (
            <MovieGrid 
              movies={movies} 
              serverId={selectedServerId}
            />
          )}
        </>
      )}
    </div>
  )
}