import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarDays, Users, Award, ArrowRight, Laptop, Music, Palette, BookOpen } from "lucide-react"
import SignInButton from "@/components/signin-button"
import { BackgroundBeams } from "@/components/ui/background-beams"
import Image from "next/image"
import { LoadingScreen } from "@/components/loading-screen"
import { CustomSVGCard } from "@/components/ui/custom-svg-card"
import CountdownTimer from "@/components/Components/Counter/CountdownTimer"
import ThreeDmodel from "@/components/3dmodel"
import { GallerySection } from "@/components/gallery-section"

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

export default function Home() {
  return (
    <LoadingScreen>
      <div className="relative min-h-screen">
        <div className="absolute inset-0 w-full h-full">
          <BackgroundBeams className="z-0" />
        </div>
        <div className="relative z-20 flex flex-col">
          {/* Content */}
          <div className="flex flex-col my-4">
            {/* Hero Section */}
            <div className="relative min-h-screen rounded-2xl">
              
              {/* 3D Model Background */}
              <div className="absolute inset-0 w-full h-full z-10">
                <ThreeDmodel/>
              </div>

              {/* Content Overlay */}
              <div className="relative z-20">
                <section className="w-full py-48 md:py-32 lg:py-32 xl:py-60">
                  <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center space-y-4 text-center">
                      <div className="relative">
                        <Image
                          src="https://r2.sdmcetinsignia.com/insignia25.svg"
                          alt="Insignia"
                          height={600}
                          width={600}
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                      <div className="space-y-8 pt-4">
                        <div className="space-x-4">
                          <Link href="/events">
                            <Button className="px-6 text-base py-2 rounded-full">Explore Events<ArrowRight /></Button>
                          </Link>
                          <SignInButton />
                        </div>
                        <CountdownTimer />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Categories Section */}
            <section className="w-full py-2">
              <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl">Event Categories</h2>
                    <p className="max-w-[700px] text-gray-200 md:text-xl">
                      Explore our diverse range of events across different categories
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <CustomSVGCard
                    href="/events?category=centralized"
                    svgPath="/Elements/centralized-card.svg"
                  />
                  <CustomSVGCard
                    href="/events?category=technical"
                    svgPath="/Elements/technical-card.svg"
                  />
                  <CustomSVGCard
                    href="/events?category=cultural"
                    svgPath="/Elements/cultural-card.svg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <CustomSVGCard                    
                    href="/events?category=finearts"
                    svgPath="/Elements/finearts-card.svg"
                  />
                  <CustomSVGCard
                    href="/events?category=literary"
                    svgPath="/Elements/literary-card.svg"
                  />
                </div>
              </div>
            </section>
            {/* Insignia Logo Section */}
            <section className="w-full py-4 md:py-24 lg:py-32 overflow-x-visible">
              <div className="container relative">
              <div className="flex flex-col items-center justify-between space-y-4 text-center mb-12">
              <div className="space-y-2 flex items-center w-full justify-between relative">
              <div className="absolute -left-[42%] md:-left-[32%] lg:-left-[35%] xl:-left-[28%] 2xl:-left-[43%] animate-spin-slow">
                <Image 
                src={"/Elements/violet-chakra.svg"} 
                alt="Insignia Logo" 
                className="p-2 w-[200px] md:w-[400px] lg:w-[600px]" 
                width={600} 
                height={100}
                />
              </div>
              <div className="mx-auto">
                <Image 
                src={"/Elements/ins-logo-yellow.svg"} 
                alt="Insignia Logo" 
                className="p-2 w-[200px] md:w-[300px] lg:w-[400px]" 
                width={400} 
                height={100}
                />
              </div>
              <div className="absolute -right-[42%] md:-right-[32%] lg:-right-[35%] xl:-right-[28%] 2xl:-right-[43%] animate-spin-slow">
                <Image 
                src={"/Elements/violet-chakra.svg"} 
                alt="Insignia Logo" 
                className="p-2 w-[200px] md:w-[400px] lg:w-[600px]" 
                width={600} 
                height={100}
                />
              </div>
              </div>
              </div>
              </div>
            </section>

            {/* Artist Section */}
            <section className="w-full py-4 md:py-24 lg:py-32">
              <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                  <div className="space-y-2">
                    <Image src={"/Elements/shashwat-singh-image.png"} alt="Shashwat Singh" className="p-2" width={600} height={100}/>
                  </div>
                    <p className="text-gray-200 max-w-xl md:text-xl">
                    Shashwat Singh is an Indian playback singer and singer-songwriter known for his work in the Hindi film industry. Born on October 16, 1990, in Allahabad (now Prayagraj), Uttar Pradesh, India, he has made significant contributions to bollywood music since his debut.
                    </p>
                </div>
              </div>
              </section>
            {/* Gallery Section */}
            <GallerySection />

            {/* Features Section */}
            <section className="w-full py-12 md:py-24 lg:py-32">
              <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="space-y-2">
                    <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                      Registration
                    </div>
                    <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl">How do you Register for Events?</h2>
                    <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
                      Follow these simple steps to register for events on Insignia:
                    </p>
                  </div>
                </div>
                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
                  <div className="flex flex-col items-center space-y-2 rounded-lg border border-purple-700/50 bg-purple-900/20 p-6 backdrop-blur-sm">
                    <div className="rounded-full bg-primary p-3 text-primary-foreground">
                      <CalendarDays className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Account Signup</h3>
                    <p className="text-center text-gray-300">
                      Create an account on Insignia to get started. It's quick and easy!
                    </p>
                  </div>
                  <div className="flex flex-col items-center space-y-2 rounded-lg border border-purple-700/50 bg-purple-900/20 p-6 backdrop-blur-sm">
                    <div className="rounded-full bg-primary p-3 text-primary-foreground">
                      <Users className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Update User Profile</h3>
                    <p className="text-center text-gray-300">
                      Manage your profile with personal details and make sure the details are genuine.
                    </p>
                  </div>
                  <div className="flex flex-col items-center space-y-2 rounded-lg border border-purple-700/50 bg-purple-900/20 p-6 backdrop-blur-sm">
                    <div className="rounded-full bg-primary p-3 text-primary-foreground">
                      <Award className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Register for Events</h3>
                    <p className="text-center text-gray-300">
                      Explore events across different categories and you are just a click away from registering for your favorite events.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="w-full py-12 md:py-24 lg:py-32">
              <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                  
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </LoadingScreen>
  )
}
