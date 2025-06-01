"use client"

import { useState } from "react"
import Image from "next/image"
import { Star, Calendar, Clock, Film, Info } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import { Movie } from "@/types"
import { cn, formatDate } from "@/lib/utils"

interface MovieCardProps {
  movie: Movie
  serverId: string
  selectable?: boolean
  selected?: boolean
  onSelectChange?: (movieId: number, isSelected: boolean) => void
  layout?: "grid" | "list"
}

export function MovieCard({
  movie,
  serverId,
  selectable = false,
  selected = false,
  onSelectChange,
  layout = "grid",
}: MovieCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  
  const handleSelect = (checked: boolean) => {
    if (onSelectChange) {
      onSelectChange(movie.stream_id, checked)
    }
  }
  
  const posterUrl = movie.stream_icon || movie.cover || "https://placehold.co/400x600/222/ccc?text=No+Image"
  
  if (layout === "list") {
    return (
      <>
        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
          {selectable && (
            <Checkbox
              checked={selected}
              onCheckedChange={handleSelect}
              className="mr-2"
            />
          )}
          
          <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-md">
            <Image
              src={posterUrl}
              alt={movie.name}
              fill
              className="object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium line-clamp-1">{movie.name}</h3>
            <div className="flex items-center text-xs text-muted-foreground gap-2 mt-1">
              {movie.year && (
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {movie.year}
                </span>
              )}
              {movie.rating && (
                <span className="flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  {movie.rating}
                </span>
              )}
              {movie.added && (
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Added: {formatDate(movie.added)}
                </span>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDetails(true)}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
        
        <MovieDetailsDialog
          movie={movie}
          serverId={serverId}
          open={showDetails}
          onOpenChange={setShowDetails}
        />
      </>
    )
  }
  
  return (
    <>
      <Card className="overflow-hidden h-full group">
        <div className="relative aspect-[2/3] overflow-hidden">
          <Image
            src={posterUrl}
            alt={movie.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          
          {selectable && (
            <div className="absolute top-2 left-2 z-10">
              <Checkbox
                checked={selected}
                onCheckedChange={handleSelect}
                className="bg-background/70 border-background"
              />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
            <div className="space-y-1 text-white">
              {movie.year && (
                <Badge variant="outline\" className="bg-black/50 border-none text-white">
                  {movie.year}
                </Badge>
              )}
              {movie.rating && (
                <Badge variant="outline" className="bg-black/50 border-none text-white">
                  <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {movie.rating}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <CardContent className="p-3">
          <h3 className="font-medium line-clamp-1 text-sm" title={movie.name}>
            {movie.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {movie.added && formatDate(movie.added)}
          </p>
        </CardContent>
        
        <CardFooter className="p-2 pt-0">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs"
            onClick={() => setShowDetails(true)}
          >
            Details
          </Button>
        </CardFooter>
      </Card>
      
      <MovieDetailsDialog
        movie={movie}
        serverId={serverId}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </>
  )
}

interface MovieDetailsDialogProps {
  movie: Movie
  serverId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function MovieDetailsDialog({ 
  movie, 
  serverId, 
  open, 
  onOpenChange 
}: MovieDetailsDialogProps) {
  const [isExporting, setIsExporting] = useState(false)
  
  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      const response = await fetch("/api/iptv/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serverId,
          movieIds: [movie.stream_id],
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
      a.download = `${movie.name}-aria2c-commands.txt`
      document.body.appendChild(a)
      a.click()
      
      // Clean up
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting movie:", error)
    } finally {
      setIsExporting(false)
    }
  }
  
  const posterUrl = movie.stream_icon || movie.cover || "https://placehold.co/400x600/222/ccc?text=No+Image"
  const backdropUrl = movie.backdrop || "https://placehold.co/1920x1080/222/ccc?text=No+Backdrop"
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        <div className="relative h-48 md:h-64 w-full">
          <Image
            src={backdropUrl}
            alt={movie.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4 flex gap-4">
            <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-md border border-border">
              <Image
                src={posterUrl}
                alt={movie.name}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="flex flex-col justify-end">
              <h2 className="text-xl font-bold">{movie.name}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {movie.year && (
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    {movie.year}
                  </Badge>
                )}
                {movie.rating && (
                  <Badge variant="outline">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {movie.rating}
                  </Badge>
                )}
                {movie.duration && (
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {movie.duration} min
                  </Badge>
                )}
                {movie.container_extension && (
                  <Badge variant="outline">
                    <Film className="h-3 w-3 mr-1" />
                    {movie.container_extension.toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 pt-2">
          {movie.plot && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-1">Plot</h3>
              <p className="text-sm text-muted-foreground">{movie.plot}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {movie.director && (
              <div>
                <h4 className="font-semibold">Director</h4>
                <p className="text-muted-foreground">{movie.director}</p>
              </div>
            )}
            
            {movie.genre && (
              <div>
                <h4 className="font-semibold">Genre</h4>
                <p className="text-muted-foreground">{movie.genre}</p>
              </div>
            )}
            
            {movie.actors && (
              <div className="md:col-span-2">
                <h4 className="font-semibold">Cast</h4>
                <p className="text-muted-foreground">{movie.actors}</p>
              </div>
            )}
            
            {movie.added && (
              <div>
                <h4 className="font-semibold">Added</h4>
                <p className="text-muted-foreground">
                  {format(new Date(movie.added), "MMMM d, yyyy")}
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? "Generating..." : "Export for aria2"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}