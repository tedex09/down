"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { IPTVServer } from "@/types"
import { useToast } from "@/hooks/use-toast"

// Form schema
const serverFormSchema = z.object({
  name: z.string().min(2, {
    message: "Server name must be at least 2 characters.",
  }),
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
  username: z.string().min(1, {
    message: "Username is required.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
})

type ServerFormValues = z.infer<typeof serverFormSchema>

interface ServerFormProps {
  server?: IPTVServer
  onSuccess?: () => void
}

export function ServerForm({ server, onSuccess }: ServerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const isEditing = !!server

  // Initialize form with default values or existing server values
  const form = useForm<ServerFormValues>({
    resolver: zodResolver(serverFormSchema),
    defaultValues: {
      name: server?.name || "",
      url: server?.url || "",
      username: server?.username || "",
      password: server?.password || "",
    },
  })

  async function onSubmit(values: ServerFormValues) {
    setIsLoading(true)
    
    try {
      const endpoint = isEditing ? "/api/iptv/server" : "/api/iptv/server"
      const method = isEditing ? "PUT" : "POST"
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(isEditing ? { ...values, id: server.id } : values),
      })
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || "Failed to save server")
      }
      
      toast({
        title: isEditing ? "Server updated" : "Server added",
        description: data.message,
      })
      
      // Navigate or call success callback
      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/servers")
        router.refresh()
      }
    } catch (error) {
      console.error("Error saving server:", error)
      toast({
        title: "Error",
        description: (error as Error).message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Server Name</FormLabel>
              <FormControl>
                <Input placeholder="My IPTV Server" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Server URL</FormLabel>
              <FormControl>
                <Input placeholder="http://example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Server" : "Add Server"}
          </Button>
        </div>
      </form>
    </Form>
  )
}