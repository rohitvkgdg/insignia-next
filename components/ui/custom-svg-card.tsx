'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface CustomSVGCardProps {
  href: string
  svgPath: string
  className?: string
}

export function CustomSVGCard({ href, svgPath, className }: CustomSVGCardProps) {
  return (
    <Link href={href}>
      <motion.div
        className={cn("relative w-full aspect-[462/657] group cursor-pointer", className)}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute inset-0">
          <img 
            src={svgPath} 
            alt="" 
            className="w-full h-full object-contain"
            loading="eager"
            aria-hidden="true"
          />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        </div>
      </motion.div>
    </Link>
  )
}