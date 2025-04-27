'use client'

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface LoadingScreenProps {
  children: React.ReactNode;
}

export function LoadingScreen({ children }: LoadingScreenProps) {
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Set a minimum loading time to prevent flickering
    const minLoadTime = 2000 // 2 seconds
    const loadTimer = setTimeout(() => {
      setIsLoading(false)
    }, minLoadTime)

    // Prevent scrolling during loading
    if (isLoading) {
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      clearTimeout(loadTimer)
      document.body.style.overflow = ''
    }
  }, [isLoading])

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[99999] bg-background flex items-center justify-center"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <div className="relative w-[400px] h-[400px]">
              <img
                src="https://r2.sdmcetinsignia.com/insignia25.svg"
                alt="Insignia"
                className="w-full h-full object-contain animate-pulse"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className={isLoading ? 'hidden' : 'contents'}
        aria-hidden={isLoading}
      >
        {children}
      </div>
    </>
  )
}