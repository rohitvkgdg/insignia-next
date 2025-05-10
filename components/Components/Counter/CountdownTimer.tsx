'use client'

import { useState, useEffect } from "react"
import Counter from "./Counter"

// Event date - May 16th 2025, 6:00 AM
const EVENT_DATE = new Date('2025-05-16T06:00:00')

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer() {
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    setMounted(true)
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const difference = EVENT_DATE.getTime() - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24)) % 100
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        return { days, hours, minutes, seconds }
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Prevent hydration mismatch by not rendering until client-side
  if (!mounted) {
    return null
  }

  const counterProps = {
    fontSize: 56,
    padding: 4,
    gap: 2,
    places: [10, 1],
    textColor: "white",
    fontWeight: "bold",
    gradientFrom: "transparent",
    gradientTo: "transparent",
    borderRadius: 8,
    horizontalPadding: 8,
  }

  const largeCounterProps = {
    ...counterProps,
    fontSize: 96,
    padding: 8,
    gap: 4,
    horizontalPadding: 16,
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-xl md:text-2xl font-bold text-white/80">Event Starts In</h2>
      <div className="grid grid-cols-4 gap-2 md:gap-6 p-2 md:p-4 w-full max-w-[95vw] md:max-w-[800px]">
        {[
          { value: timeLeft.days, label: "Days" },
          { value: timeLeft.hours, label: "Hours" },
          { value: timeLeft.minutes, label: "Minutes" },
          { value: timeLeft.seconds, label: "Seconds" }
        ].map(({ value, label }) => (
          <div key={label} 
            className="bg-purple-900/20 backdrop-blur-[20px] rounded-lg md:rounded-xl p-2 md:p-6 border border-purple-700/50 flex flex-col items-center transform transition-transform hover:scale-105 shadow-[0_8px_16px_rgb(0_0_0_/_0.4)] hover:shadow-[0_16px_32px_rgb(0_0_0_/_0.4)] duration-300" 
            style={{ transform: "perspective(1000px) rotateX(10deg)" }}
          >
            <div className="hidden md:block">
              <Counter value={value} {...largeCounterProps} />
            </div>
            <div className="md:hidden">
              <Counter value={value} {...counterProps} />
            </div>
            <span className="text-xs md:text-lg text-white/60 md:mt-4 font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}