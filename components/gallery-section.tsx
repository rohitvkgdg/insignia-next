"use client"

import Stack from "./Components/Stack/Stack"

export function GallerySection() {
    return (
        <section className="w-full py-12 md:py-10 lg:py-16 bg-transparent">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl">Gallery</h2>
                        <p className="max-w-[900px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                            Swipe through our event memories
                        </p>
                    </div>
                    <div className="w-full max-w-full overflow-hidden">
                        <div className="flex flex-col md:flex-row md:gap-x-20 justify-center items-center">
                            <Stack
                                cardDimensions={{ width: 300, height: 375 }}
                                sensitivity={300}
                                randomRotation={true}
                                sendToBackOnClick={true}
                                cardsData={[
                                    {
                                        id: 2,
                                        img: "https://r2.sdmcetinsignia.com/insignia-pics/IMG2.JPG"
                                    },
                                    {
                                        id: 3,
                                        img: "https://r2.sdmcetinsignia.com/insignia-pics/IMG3.JPG"
                                    },
                                    {
                                        id: 4,
                                        img: "https://r2.sdmcetinsignia.com/insignia-pics/IMG5.JPG"
                                    },
                                    {
                                        id: 5,
                                        img: "https://r2.sdmcetinsignia.com/insignia-pics/IMG7.JPG"
                                    },
                                    {
                                        id: 6,
                                        img: "https://r2.sdmcetinsignia.com/insignia-pics/IMG8.JPG"
                                    },
                                    {
                                        id: 7,
                                        img: "https://r2.sdmcetinsignia.com/insignia-pics/IMG14.JPG"
                                    },
                                ]}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}