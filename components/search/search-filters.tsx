"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CalendarIcon, FilterIcon, SlidersHorizontal, X } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Category } from "@/types"
import { cn } from "@/lib/utils"

interface SearchFiltersProps {
  categories: Category[]
  onSearch: (params: {
    query?: string
    categoryId?: string
    fromDate?: string
    sortBy?: string
    sortOrder?: string
  }) => void
}

export function SearchFilters({ categories, onSearch }: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [query, setQuery] = useState(searchParams.get("query") || "")
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "")
  const [fromDate, setFromDate] = useState<Date | undefined>(
    searchParams.get("fromDate") ? new Date(searchParams.get("fromDate") as string) : undefined
  )
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "name")
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "asc")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  
  // Count active filters
  const activeFiltersCount = [
    categoryId,
    fromDate,
    sortBy !== "name" || sortOrder !== "asc",
  ].filter(Boolean).length
  
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    onSearch({
      query: query || undefined,
      categoryId: categoryId || undefined,
      fromDate: fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
      sortBy,
      sortOrder,
    })
    
    if (mobileFiltersOpen) {
      setMobileFiltersOpen(false)
    }
  }
  
  const handleReset = () => {
    setQuery("")
    setCategoryId("")
    setFromDate(undefined)
    setSortBy("name")
    setSortOrder("asc")
    
    onSearch({})
    
    if (mobileFiltersOpen) {
      setMobileFiltersOpen(false)
    }
  }
  
  // Handle search on Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }
  
  // Effect to update search when params change from outside
  useEffect(() => {
    const newQuery = searchParams.get("query") || ""
    const newCategoryId = searchParams.get("categoryId") || ""
    const newFromDate = searchParams.get("fromDate")
      ? new Date(searchParams.get("fromDate") as string)
      : undefined
    const newSortBy = searchParams.get("sortBy") || "name"
    const newSortOrder = searchParams.get("sortOrder") || "asc"
    
    setQuery(newQuery)
    setCategoryId(newCategoryId)
    setFromDate(newFromDate)
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
  }, [searchParams])
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 opacity-70"
              onClick={() => {
                setQuery("")
                handleSubmit()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="hidden md:flex gap-2">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-[180px]">
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
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[180px] justify-start text-left font-normal",
                  !fromDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fromDate ? format(fromDate, "PPP") : "From Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={setFromDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="added">Date Added</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="md:hidden flex gap-2">
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex-shrink-0">
                <FilterIcon className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80%]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="w-full">
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
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">From Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !fromDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fromDate ? format(fromDate, "PPP") : "Any date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={fromDate}
                        onSelect={setFromDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="added">Date Added</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger>
                        <SelectValue placeholder="Order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={handleReset}>
                    Reset
                  </Button>
                  <Button className="flex-1" onClick={() => handleSubmit()}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <Button onClick={() => handleSubmit()}>Search</Button>
        </div>
        
        <div className="hidden md:block">
          <Button onClick={() => handleSubmit()}>Search</Button>
        </div>
      </div>
      
      <div className="hidden md:flex flex-wrap gap-2 text-sm">
        {activeFiltersCount > 0 && (
          <>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-xs"
              onClick={handleReset}
            >
              <X className="h-3 w-3 mr-1" />
              Clear all filters
            </Button>
            
            {categoryId && (
              <div className="bg-accent text-accent-foreground rounded-full px-3 py-1 flex items-center gap-1">
                Category: {categories.find(c => c.category_id === categoryId)?.category_name}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => {
                    setCategoryId("")
                    handleSubmit()
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {fromDate && (
              <div className="bg-accent text-accent-foreground rounded-full px-3 py-1 flex items-center gap-1">
                From: {format(fromDate, "MMM d, yyyy")}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => {
                    setFromDate(undefined)
                    handleSubmit()
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {(sortBy !== "name" || sortOrder !== "asc") && (
              <div className="bg-accent text-accent-foreground rounded-full px-3 py-1 flex items-center gap-1">
                Sort: {sortBy === "name" ? "Name" : sortBy === "added" ? "Date Added" : "Rating"} ({sortOrder === "asc" ? "A-Z" : "Z-A"})
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => {
                    setSortBy("name")
                    setSortOrder("asc")
                    handleSubmit()
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}