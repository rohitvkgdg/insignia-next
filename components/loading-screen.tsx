'use client'

import { useEffect, useState, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface LoadingScreenProps {
  children: React.ReactNode
}

// Memoize the loading animation component
const LoadingAnimation = memo(() => (
  <motion.div
    key="loading"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="fixed inset-0 bg-background flex items-center justify-center"
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 99999999,
      background: '#0a0714'
    }}
  >
    <div className="relative w-[300px] h-[300px] flex items-center justify-center">
      <img
        src="https://r2.sdmcetinsignia.com/insignia25.svg"
        alt="Insignia"
        className="w-full h-full object-contain animate-pulse"
        style={{ willChange: 'transform' }}
      />
    </div>
  </motion.div>
))
LoadingAnimation.displayName = 'LoadingAnimation'

export function LoadingScreen({ children }: LoadingScreenProps) {
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Set a minimum loading time to prevent flickering
    const minLoadTime = 1000 // 1 second
    const loadTimer = setTimeout(() => {
      setIsLoading(false)
    }, minLoadTime)

    // Use requestIdleCallback for non-critical operations
    const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1))
    
    // Prevent scrolling during loading
    if (isLoading) {
      document.body.style.overflow = 'hidden'
      
      // Preload critical resources during idle time
      idleCallback(() => {
        const preloadLink = document.createElement('link')
        preloadLink.rel = 'preload'
        preloadLink.as = 'image'
        preloadLink.href = 'https://r2.sdmcetinsignia.com/insignia25.svg'
        document.head.appendChild(preloadLink)
      })
    }
    
    return () => {
      clearTimeout(loadTimer)
      document.body.style.overflow = ''
    }
  }, [isLoading])

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <LoadingAnimation />}
      </AnimatePresence>

      <div 
        className={isLoading ? 'hidden' : 'contents'}
        aria-hidden={isLoading}
        style={{ 
          visibility: isLoading ? 'hidden' : 'visible',
          contentVisibility: isLoading ? 'hidden' : 'visible'
        }}
      >
        {children}
      </div>
    </>
  )
}