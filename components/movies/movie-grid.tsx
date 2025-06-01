"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Download, LayoutGrid, LayoutList } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { MovieCard } from "@/components/movies/movie-card"

import { Movie } from "@/types"
import { cn } from "@/lib/utils"

interface MovieGridProps {
  movies: Movie[]
  serverId: string
  isLoading?: boolean
}

export function MovieGrid({ movies, serverId, isLoading = false }: MovieGridProps) {
  const [selectedMovies, setSelectedMovies] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [layout, setLayout] = useState<"grid" | "list">("grid")
  const [isExporting, setIsExporting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Filter movies based on search query
  const filteredMovies = movies.filter(movie => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase()
    return (
      movie.name.toLowerCase().includes(query) ||
      (movie.plot?.toLowerCase().includes(query)) ||
      (movie.genre?.toLowerCase().includes(query)) ||
      (movie.director?.toLowerCase().includes(query))
    )
  })
  
  const handleSelectMovie = (movieId: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedMovies(prev => [...prev, movieId])
    } else {
      setSelectedMovies(prev => prev.filter(id => id !== movieId))
    }
  }
  
  const handleExportSelected = async () => {
    if (selectedMovies.length === 0) return
    
    setIsExporting(true)
    
    try {
      const response = await fetch("/api/iptv/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serverId,
          movieIds: selectedMovies,
        }),
      })
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || "Failed to generate export data")
      }
      
      // Create download link
      const commands = data.data.commands.join("\n")
      const blob = new Blob([commands], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement("a")
      a.href = url
      a.download = "aria2c-commands.txt"
      document.body.appendChild(a)
      a.click()
      
      // Clean up
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      // Reset selection
      setSelectedMovies([])
    } catch (error) {
      console.error("Error exporting movies:", error)
    } finally {
      setIsExporting(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No movies found</h3>
        <p className="text-muted-foreground">Try adjusting your search or filters</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="relative w-full md:w-80">
          <Input
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Tabs value={layout} onValueChange={(v) => setLayout(v as "grid" | "list")}>
            <TabsList>
              <TabsTrigger value="grid">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list">
                <LayoutList className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "ml-2 transition-opacity",
              selectedMovies.length === 0 ? "opacity-50 cursor-not-allowed" : "opacity-100"
            )}
            disabled={selectedMovies.length === 0 || isExporting}
            onClick={handleExportSelected}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export Selected ({selectedMovies.length})
          </Button>
        </div>
      </div>
      
      {filteredMovies.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No results found</h3>
          <p className="text-muted-foreground">
            No movies matching "{searchQuery}"
          </p>
        </div>
      ) : (
        <>
          <Separator />
          
          {layout === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.stream_id}
                  movie={movie}
                  serverId={serverId}
                  selectable
                  selected={selectedMovies.includes(movie.stream_id)}
                  onSelectChange={handleSelectMovie}
                  layout="grid"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-1 border rounded-lg">
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.stream_id}
                  movie={movie}
                  serverId={serverId}
                  selectable
                  selected={selectedMovies.includes(movie.stream_id)}
                  onSelectChange={handleSelectMovie}
                  layout="list"
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}