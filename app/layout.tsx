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
import Image from "next/image"

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="space-y-4">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    </div>
  )
}

function LoadingScreen({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      {children}
    </Suspense>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={fresca.className}>
        <LoadingScreen>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <div className="relative flex min-h-screen flex-col bg-[#0a0714] overflow-hidden">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-blue-950 to-transparent opacity-70 z-0" />
                <div className="absolute flex top-1 w-[90%] items-center mx-4 lg:left-20 lg:right-10 justify-around z-30">
                  <Image src={"/images/sdm-logo.png"} alt="SDM Logo" className="p-2" width={50} height={20} />
                  <p className="text-[12px] md:text-lg lg:text-xl px-3 text-center font-bold text-white">SHRI DHARMASTHALA MANJUNATHESHWARA COLLEGE OF ENGINEERING & TECHNOLOGY</p>
                  <Image src={"/images/hegde.png"} alt="Image" width={40} className="p-1" height={25} />
                </div>

                {/* Noise Texture Overlay
                <div className="absolute inset-0 w-full h-full opacity-5 z-500">
                  <svg width="100%" height="100%">
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
                </div> */}

                <Navbar />
                <main className="flex-1 relative z-10">
                  {children}
                </main>
                <Footer />
              </div>
            </AuthProvider>
          </ThemeProvider>
          <Toaster />
        </LoadingScreen>
      </body>
    </html>
  )
}
