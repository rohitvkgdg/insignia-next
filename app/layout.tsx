import "@/styles/globals.css"
import { type Metadata } from "next"
import { Inter } from "next/font/google"
import localFont from 'next/font/local'

import { AuthProvider } from "@/components/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
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
            <div className="relative flex min-h-screen flex-col bg-[#0a0714] overflow-hidden">
              {/* Gradient Overlaybg-[#1b133a] */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-blue-950 to-transparent opacity-70 z-0" />

              {/* Noise Texture Overlay */}
              <svg className="absolute inset-0 w-full h-full opacity-5 z-0" xmlns="http://www.w3.org/2000/svg">
                <filter id="noiseFilter">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.7"
                    numOctaves="2"
                    stitchTiles="stitch"
                  />
                </filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)" />
              </svg>
              
              <Navbar />
              <Suspense fallback={<Loading />}>
                <main className="flex-1 relative z-10">{children}</main>
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
