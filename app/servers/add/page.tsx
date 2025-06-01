import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ServerForm } from "@/components/servers/server-form"

export default function AddServerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link href="/servers">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold">Add IPTV Server</h1>
        <p className="text-muted-foreground">
          Configure a new IPTV server connection
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Server Details</CardTitle>
          <CardDescription>
            Enter your Xtream Codes IPTV server credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServerForm />
        </CardContent>
      </Card>
    </div>
  )
}