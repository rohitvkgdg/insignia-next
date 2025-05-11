'use client';

import { Suspense } from "react"
import Link from "next/link"
import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import { CalendarDays, Users, Award, ArrowRight } from "lucide-react"
import Image from "next/image"
import { CustomSVGCard } from "@/components/ui/custom-svg-card"

// Dynamically import client components with no SSR
const CountdownTimer = dynamic(
    () => import("@/components/Components/Counter/CountdownTimer"),
    { ssr: false }
);

const ThreeDmodel = dynamic(
    () => import("@/components/3dmodel"),
    { ssr: false }
);

const BackgroundBeamsClient = dynamic(
    () => import("@/components/ui/background-beams").then(mod => ({ default: mod.BackgroundBeams })),
    { ssr: false }
);

const SignInButton = dynamic(
    () => import("@/components/signin-button"),
    { ssr: false }
);

const GallerySection = dynamic(
    () => import("@/components/gallery-section").then(mod => ({ default: mod.GallerySection })),
    { ssr: false }
);

// Loading component for sections
function SectionLoading() {
    return (
        <div className="w-full h-[400px] flex items-center justify-center">
            <div className="animate-pulse bg-purple-900/20 w-full h-full rounded-lg" />
        </div>
    );
}

export function LandingPageContent() {
    return (
        <Suspense fallback={<SectionLoading />}>
            <div className="relative min-h-screen">
                <div className="absolute inset-0 w-full h-full">
                    <Suspense fallback={null}>
                        <BackgroundBeamsClient className="z-25" />
                    </Suspense>
                </div>
                <div className="relative z-20 flex flex-col">
                    <div className="flex flex-col my-4">
                        {/* Hero Section */}
                        <div className="relative min-h-screen rounded-2xl">
                            {/* 3D Model Background */}
                            <div className="absolute inset-0 w-full h-full z-10">
                                <Suspense fallback={
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="animate-pulse bg-purple-900/20 w-full h-full" />
                                    </div>
                                }>
                                    <ThreeDmodel />
                                </Suspense>
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
                                                    priority
                                                    style={{ objectFit: 'contain' }}
                                                />
                                            </div>
                                            <div className="space-y-8 pt-4">
                                                <div className="space-x-4">
                                                    <Link href="/events">
                                                        <Button className="px-6 text-base py-2 rounded-full">
                                                            Explore Events<ArrowRight />
                                                        </Button>
                                                    </Link>
                                                    <Suspense fallback={<Button variant="outline" className="rounded-full">Loading...</Button>}>
                                                        <SignInButton />
                                                    </Suspense>
                                                </div>
                                                <Suspense fallback={<div className="h-[50px] w-full bg-purple-900/20 animate-pulse rounded" />}>
                                                    <CountdownTimer />
                                                </Suspense>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* Categories Section */}
                        <Suspense fallback={<SectionLoading />}>
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
                                            svgPath="/Elements/centralized-card.webp"
                                        />
                                        <CustomSVGCard
                                            href="/events?category=technical"
                                            svgPath="/Elements/technical-card.webp"
                                        />
                                        <CustomSVGCard
                                            href="/events?category=cultural"
                                            svgPath="/Elements/cultural-card.webp"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                                        <CustomSVGCard
                                            href="/events?category=finearts"
                                            svgPath="/Elements/finearts-card.webp"
                                        />
                                        <CustomSVGCard
                                            href="/events?category=literary"
                                            svgPath="/Elements/literary-card.webp"
                                        />
                                    </div>
                                </div>
                            </section>
                        </Suspense>

                        {/* Insignia Logo Section */}
                        <Suspense fallback={<SectionLoading />}>
                            <section className="w-full py-4 md:py-24 lg:py-32 overflow-x-visible">
                                <div className="container relative">
                                    <div className="flex flex-col items-center justify-between space-y-4 text-center mb-12">
                                        <div className="space-y-2 flex items-center w-full justify-between relative">
                                            <div className="absolute -left-[42%] md:-left-[32%] lg:-left-[35%] xl:-left-[28%] 2xl:-left-[43%] animate-spin-slow">
                                                <Image
                                                    src={"/Elements/violet-chakra.webp"}
                                                    alt="Insignia Logo"
                                                    className="p-2 w-[200px] md:w-[400px] lg:w-[600px]"
                                                    width={600}
                                                    height={100}
                                                />
                                            </div>
                                            <div className="mx-auto">
                                                <Image
                                                    src={"/Elements/ins-logo-yellow.webp"}
                                                    alt="Insignia Logo"
                                                    className="p-2 w-[200px] md:w-[300px] lg:w-[400px]"
                                                    width={400}
                                                    height={100}
                                                />
                                            </div>
                                            <div className="absolute -right-[42%] md:-right-[32%] lg:-right-[35%] xl:-right-[28%] 2xl:-right-[43%] animate-spin-slow">
                                                <Image
                                                    src={"/Elements/violet-chakra.webp"}
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
                        </Suspense>
                        {/* Artist Section */}
                        <Suspense fallback={<SectionLoading />}>
                            <section className="w-full py-4 md:py-24 lg:py-32">
                                <div className="container px-4 md:px-6">
                                    <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                                        <div className="space-y-2">
                                            <Image src={"/Elements/shashwat-singh-image.webp"} alt="Shashwat Singh" className="p-2" width={600} height={100} />
                                        </div>
                                        <p className="text-gray-200 max-w-xl md:text-xl">
                                            Shashwat Singh is an Indian playback singer and singer-songwriter known for his work in the Hindi film industry. Born on October 16, 1990, in Allahabad (now Prayagraj), Uttar Pradesh, India, he has made significant contributions to bollywood music since his debut.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </Suspense>

                        {/* Features Section */}
                        <Suspense fallback={<SectionLoading />}>
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
                        </Suspense>
                    </div>
                </div>
            </div>
        </Suspense>
    );
}