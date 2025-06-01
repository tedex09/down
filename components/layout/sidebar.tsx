"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  ServerIcon, 
  Film, 
  Search, 
  Settings, 
  TvIcon,
  MenuIcon,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      current: pathname === "/"
    },
    {
      name: "Servers",
      href: "/servers",
      icon: ServerIcon,
      current: pathname === "/servers" || pathname.startsWith("/servers/")
    },
    {
      name: "Movies",
      href: "/movies",
      icon: Film,
      current: pathname === "/movies" || pathname.startsWith("/movies/")
    },
    {
      name: "Search",
      href: "/search",
      icon: Search,
      current: pathname === "/search"
    },
    {
      name: "Live TV",
      href: "/live",
      icon: TvIcon,
      current: pathname === "/live"
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      current: pathname === "/settings"
    }
  ]

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={20} /> : <MenuIcon size={20} />}
      </Button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-transform",
          "w-64 bg-card border-r border-border shadow-md",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex h-16 items-center px-6 border-b border-border">
            <Link href="/" className="flex items-center gap-2">
              <TvIcon className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">IPTV Dashboard</span>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center p-3 rounded-md group transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      item.current 
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <span className="text-xs font-medium">IP</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">IPTV Dashboard</p>
                <p className="text-xs text-muted-foreground">v1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}