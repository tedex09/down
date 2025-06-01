import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/ui/theme-provider"
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IPTV Dashboard',
  description: 'Manage your IPTV servers and media content',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen">
            <Sidebar className="hidden md:block" />
            <div className="flex-1 md:ml-64">
              <Header />
              <main className="container py-6 px-4 md:px-6">
                {children}
              </main>
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}