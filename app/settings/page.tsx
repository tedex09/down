"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Storage } from "@/lib/storage"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [isResetting, setIsResetting] = useState(false)
  
  const handleResetData = () => {
    setIsResetting(true)
    
    try {
      // Clear all stored data
      localStorage.clear()
      
      toast({
        title: "Data Reset",
        description: "All stored data has been cleared successfully",
      })
      
      // Reload the page to apply changes
      window.location.reload()
    } catch (error) {
      console.error("Error resetting data:", error)
      toast({
        title: "Error",
        description: "Failed to reset data",
        variant: "destructive",
      })
    } finally {
      setIsResetting(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your dashboard preferences
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how the dashboard looks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme</label>
              <Select
                value={theme}
                onValueChange={(value) => setTheme(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Manage your stored data and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm">
                Your IPTV server credentials and settings are stored locally on your device.
              </p>
              <p className="text-sm text-muted-foreground">
                You can reset all data to start fresh.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete all your stored IPTV servers and settings.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleResetData}
                    disabled={isResetting}
                  >
                    {isResetting ? "Resetting..." : "Reset Data"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}