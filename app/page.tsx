export const metadata = {
  title: "Insignia | A National Level Techno-cultural Fest",
  description: "Register for SDMCET's premier events through Insignia. Your one-stop platform for academic, technical, and cultural events at SDM College of Engineering & Technology, Dharwad.",
  openGraph: {
    title: "Insignia | A National Level Techno-cultural Fest",
    description: "Join Insignia | A National Level Techno-cultural Fest in SDMCET. Register for events, and stay connected with the college community.",
    url: "https://sdmcetinsignia.com",
    type: "website",
    images: [
      {
        url: "/placeholder-logo.png",
        width: 1200,
        height: 630,
        alt: "Insignia SDMCET",
      },
    ],
  },
}

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarDays, Users, Award, ArrowRight } from "lucide-react"
import SignInButton from "@/components/signin-button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 indian-pattern">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Welcome to <span className="gradient-text">Insignia</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                The premier event management platform for college students. Register for events, track your
                applications, and connect with peers.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/events">
                <Button className="px-8">Explore Events</Button>
              </Link>
              <SignInButton />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Everything You Need</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Insignia provides a comprehensive platform for all your event management needs.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full bg-primary p-3 text-primary-foreground">
                <CalendarDays className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Event Registration</h3>
              <p className="text-center text-muted-foreground">
                Register for multiple events with a single click. Track your applications and payment status.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full bg-primary p-3 text-primary-foreground">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">User Profiles</h3>
              <p className="text-center text-muted-foreground">
                Create and manage your profile with personal details and event registration history.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full bg-primary p-3 text-primary-foreground">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Event Categories</h3>
              <p className="text-center text-muted-foreground">
                Explore events across different categories - Centralized, Technical, Cultural, Finearts, and Literary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to Get Started?</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Join Insignia today and start exploring events that match your interests.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/auth/signin">
                <Button className="px-8">Sign Up Now</Button>
              </Link>
              <Link href="/events">
                <Button variant="outline">
                  View Events <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
