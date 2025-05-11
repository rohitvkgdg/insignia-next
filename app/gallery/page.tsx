import { Metadata } from 'next'
import { Suspense } from 'react'
import { GallerySection } from '@/components/gallery-section'
import { VideoPlayer } from '@/components/ui/video-player'

// Loading component for sections
function SectionLoading() {
  return (
    <div className="w-full h-[400px] flex items-center justify-center">
      <div className="animate-pulse bg-purple-900/20 w-full h-full rounded-lg" />
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Gallery | SDMCET Insignia',
  description: 'View photos and videos from previous editions of SDMCET Insignia',
}

export default function GalleryPage() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="w-full">
        <div className="container mx-auto pt-36 px-4">
          <h1 className="text-4xl font-bold mb-12 text-center">Gallery</h1>
          
          <div className="flex flex-col items-center gap-24">
            <section className="w-full flex flex-col items-center">
              <h2 className="text-3xl font-semibold mb-8 text-center">Artist Highlights</h2>
              <VideoPlayer 
                src="https://r2.sdmcetinsignia.com/Artist%20Introl(2).mp4"
                poster="https://r2.sdmcetinsignia.com/artist-thumbnail.png"
                isVertical={true}
                className="mx-auto"
              />
            </section>
          </div>
        </div>

        <section className="w-full mt-24">
          <h2 className="text-3xl font-semibold text-center">Photo Gallery</h2>
          <p className="text-center text-gray-500">
            Explore our event memories
          </p>
          <Suspense fallback={<SectionLoading />}>
            <GallerySection />
          </Suspense>
        </section>
      </div>
    </main>
  )
}