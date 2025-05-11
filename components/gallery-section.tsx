'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import CircularGallery with no SSR
const CircularGallery = dynamic(
    () => import('./Components/CircularGallery/CircularGallery'),
    { ssr: false }
);

export function GallerySection() {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    const galleryItems = [
        {
            image: "https://r2.sdmcetinsignia.com/insignia-pics/IMG2.webp",
            text: ""
        },
        {
            image: "https://r2.sdmcetinsignia.com/insignia-pics/IMG3.webp",
            text: ""
        },
        {
            image: "https://r2.sdmcetinsignia.com/insignia-pics/IMG5.webp",
            text: ""
        },
        {
            image: "https://r2.sdmcetinsignia.com/insignia-pics/IMG7.webp",
            text: ""
        },
        {
            image: "https://r2.sdmcetinsignia.com/insignia-pics/IMG8.webp",
            text: ""
        },
        {
            image: "https://r2.sdmcetinsignia.com/insignia-pics/IMG14.webp",
            text: ""
        },
        {
            image: "https://r2.sdmcetinsignia.com/insignia-pics/IMG6.webp",
            text: ""
        },
        {
            image: "https://r2.sdmcetinsignia.com/insignia-pics/IMG9.webp",
            text: ""
        },
        {
            image: "https://r2.sdmcetinsignia.com/insignia-pics/IMG11.webp",
            text: ""
        },
        {
            image: "https://r2.sdmcetinsignia.com/insignia-pics/IMG10.webp",
            text: ""
        },
        {
            image: "https://r2.sdmcetinsignia.com/insignia-pics/IMG13.webp",
            text: ""
        }
    ];

    if (!mounted) {
        return (
            <section id="gallery" className="w-screen py-12 md:py-0 bg-transparent">
                <div className="flex w-screen px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
<div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl">Gallery</h2>
                            <p className="max-w-[900px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                                Explore our event memories
                            </p>
                        </div>
                <div className="w-full h-[600px] overflow-hidden bg-purple-900/20 animate-pulse rounded-lg" />
</div>
            </div>
</section>
        );
    }

    return (
        <div className="w-screen h-[600px] overflow-hidden flex items-center justify-center">
            <CircularGallery 
                items={galleryItems}
                bend={1}
                textColor="#ffffff"
                borderRadius={0.05}
                font="bold 24px DM Sans"
            />
        </div>
    );
}