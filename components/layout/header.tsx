"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { Film, Search, Settings } from "lucide-react"

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const pathname = usePathname()
  
  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }
  
  const routes = [
    {
      href: "/movies",
      label: "Movies",
      icon: Film,
      active: isActive("/movies"),
    },
    {
      href: "/search",
      label: "Search",
      icon: Search,
      active: isActive("/search"),
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      active: isActive("/settings"),
    },
  ]

  return (
    <header className={cn(
      "flex h-16 items-center px-4 md:px-6 border-b border-border sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="flex items-center gap-2 md:gap-4 w-full justify-between">
        <div className="hidden md:flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">IPTV Dashboard</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-2">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={route.active ? "default" : "ghost"}
              className={cn(
                "text-sm font-medium transition-colors",
                route.active ? "text-primary-foreground" : "text-muted-foreground"
              )}
              asChild
            >
              <Link href={route.href}>
                <route.icon className="h-4 w-4 mr-2" />
                {route.label}
              </Link>
            </Button>
          ))}
        </nav>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}