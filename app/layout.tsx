import "@/styles/globals.css"
import { type Metadata } from "next"
import { Inter } from "next/font/google"
import localFont from 'next/font/local'

import { AuthProvider } from "@/components/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ErrorBoundary from "@/components/error-boundary"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { monitor } from "@/lib/monitor"

const inter = Inter({ subsets: ["latin"] })
const fresca = localFont({
  src: '../public/fresca.ttf',
  variable: '--font-fresca',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Insignia",
  description: "Event Management Platform",
}

function Loading() {
  return (
    <div className="container mx-auto p-4">
      <div className="space-y-4">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    </div>
  )
}

// Initialize performance monitoring
if (typeof window !== "undefined") {
  monitor.getPerformanceMetrics()
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={fresca.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <Suspense fallback={<Loading />}>
                <main className="flex-1">{children}</main>
              </Suspense>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
