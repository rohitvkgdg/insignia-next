import "@/styles/globals.css"
import { type Metadata } from "next"
import { Inter } from "next/font/google"

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

export const metadata: Metadata = {
  title: {
    default: "Insignia | SDMCET Event Management Platform",
    template: "%s | Insignia"
  },
  description: "Insignia is the premier event management platform for SDM College of Engineering & Technology, offering seamless registration for academic, cultural, and technical events.",
  keywords: ["SDMCET", "events", "college events", "technical events", "cultural events", "engineering college", "Dharwad", "Karnataka"],
  authors: [{ name: "SDMCET" }],
  creator: "SDMCET",
  publisher: "SDMCET",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://sdmcetinsignia.com"),
  openGraph: {
    title: "Insignia | SDMCET Event Management Platform",
    description: "Join Insignia - Your gateway to SDMCET's premier events. Register for academic, cultural, and technical events seamlessly.",
    url: "https://sdmcetinsignia.com",
    siteName: "Insignia",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: "Insignia | SDMCET Event Management Platform",
    description: "Join Insignia - Your gateway to SDMCET's premier events. Register for academic, cultural, and technical events seamlessly.",
    creator: "@sdmcet",
  },
  verification: {
    google: "your-google-site-verification-code", // You'll need to add your actual verification code here
  },
  alternates: {
    canonical: "https://sdmcetinsignia.com",
  },
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
  error,
}: {
  children: React.ReactNode
  error?: Error & { digest?: string }
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              {error ? (
                <ErrorBoundary error={error} reset={() => window.location.reload()} />
              ) : (
                <Suspense fallback={<Loading />}>
                  <main className="flex-1">{children}</main>
                </Suspense>
              )}
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
