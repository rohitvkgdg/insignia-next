import "@/styles/globals.css"
import { type Metadata, type Viewport } from "next"
import { Inter } from "next/font/google"
import localFont from 'next/font/local'

import { AuthProvider } from "@/components/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Suspense } from "react"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import ErrorBoundary from "@/components/error-boundary"

const fresca = localFont({
  src: '../public/fresca.ttf',
  variable: '--font-fresca',
  display: 'swap',
  preload: true,
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
}

export const metadata: Metadata = {
  title: "Insignia '25 | A National Level Techno-cultural Fest at SDMCET",
  description: "Register for SDMCET's premier events, Insignia. A festival for academic, technical, and cultural events at SDM College of Engineering & Technology, Dharwad.",
  icons: {
    icon: [
      {
        url: "/images/insignia-yellow.webp",
        sizes: "32x32",
        type: "image/png"
      },
      {
        url: "/images/insignia-yellow.webp",
        sizes: "16x16",
        type: "image/png"
      }
    ],
    apple: {
      url: "/images/insignia-yellow.webp",
      sizes: "180x180",
      type: "image/png"
    }
  },
  openGraph: {
    title: "Insignia | A National Level Techno-cultural Fest",
    description: "Join Insignia | A National Level Techno-cultural Fest in SDMCET. Register for events, and stay connected with the college community.",
    url: "https://app.sdmcetinsignia.com",
    siteName: "Insignia SDMCET",
    locale: "en_US",
    type: "website",
    images: [{
      url: "http://localhost:5174/Elements/ins-logo-yellow.webp",
      width: 1200,
      height: 630,
      alt: "Insignia SDMCET Logo",
      type: "image/png",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Insignia | A National Level Techno-cultural Fest",
    description: "Join Insignia | A National Level Techno-cultural Fest in SDMCET. Register for events, and stay connected with the college community.",
    images: ["http://localhost:5174/Elements/ins-logo-yellow.webp"],
  },
  alternates: {
    canonical: "https://app.sdmcetinsignia.com"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true
    }
  },
  keywords: [
    "Insignia",
    "SDMCET",
    "techno-cultural fest",
    "college events",
    "technical events",
    "cultural events",
    "Dharwad",
    "engineering college",
    "student fest"
  ],
  other: {
    "google-site-verification": "your-verification-code",
    "msvalidate.01": "your-bing-code",
    "application-name": "Insignia SDMCET",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black",
    "apple-mobile-web-app-title": "Insignia SDMCET",
    "format-detection": "telephone=no",
    "HandheldFriendly": "True"
  },
  verification: {
    other: {
      "link-structure": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Insignia SDMCET",
        "url": "https://app.sdmcetinsignia.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://app.sdmcetinsignia.com/events?search={search_term_string}",
          "query-input": "required name=search_term_string"
        },
        "hasPart": [
          {
            "@type": "SiteNavigationElement",
            "name": "Home",
            "url": "https://app.sdmcetinsignia.com"
          },
          {
            "@type": "SiteNavigationElement",
            "name": "Events",
            "url": "https://app.sdmcetinsignia.com/events"
          },
          {
            "@type": "SiteNavigationElement",
            "name": "Gallery",
            "url": "https://app.sdmcetinsignia.com/#gallery"
          },
        ]
      })
    }
  }
}

function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0714]">
      <div className="flex flex-col items-center space-y-4">
        <Image 
          src="/Elements/ins-logo-yellow.webp"
          alt="Insignia Logo"
          width={200}
          height={200}
          priority
        />
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-lg text-primary">Loading Insignia...</p>
        </div>
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

async function resetAction() {
  'use server'
  // You can add any server-side cleanup logic here
  return
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical assets */}
        <link 
          rel="preload" 
          href="/Elements/ins-logo-yellow.webp" 
          as="image" 
          type="image/svg+xml"
        />
        <link 
          rel="preload" 
          href="/images/sdm-logo.webp" 
          as="image"
          type="image/png"
        />
      </head>
      <body className={fresca.className}>
        <ErrorBoundary error={null} resetAction={resetAction}>
          <LoadingScreen>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <AuthProvider>
                <div className="relative flex min-h-screen flex-col bg-[#0a0714] overflow-hidden">
                  {/* Gradient Overlay with reduced opacity */}
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-blue-950 to-transparent opacity-50 z-0" />
                  <div className="absolute flex top-1 w-[90%] items-center mx-4 lg:left-20 lg:right-10 justify-around z-30">
                    <Image 
                      src="/images/sdm-logo.webp" 
                      alt="SDM Logo" 
                      width={50} 
                      height={20} 
                      priority
                      loading="eager"
                    />
                    <p className="text-[12px] md:text-lg lg:text-xl px-3 text-center font-bold text-white">
                      SHRI DHARMASTHALA MANJUNATHESHWARA COLLEGE OF ENGINEERING & TECHNOLOGY
                    </p>
                    <Image 
                      src="/images/hegde.webp" 
                      alt="Image" 
                      width={40} 
                      height={25} 
                      priority
                      loading="eager"
                    />
                  </div>
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
        </ErrorBoundary>
      </body>
    </html>
  )
}
