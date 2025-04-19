import { env } from "@/env.mjs"
import { logger } from "./logger"

interface PerformanceMetrics {
  timeToFirstByte: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  firstInputDelay: number
  cumulativeLayoutShift: number
}

class Monitor {
  private isDevelopment = env.NODE_ENV === "development"

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeErrorHandlers()
      this.initializePerformanceObserver()
    }
  }

  private initializeErrorHandlers() {
    window.onerror = (message, source, lineno, colno, error) => {
      this.logError("Uncaught error", error ?? new Error(String(message)), {
        source,
        lineno,
        colno,
      })
    }

    window.onunhandledrejection = (event) => {
      this.logError(
        "Unhandled promise rejection",
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        { type: "unhandledrejection" }
      )
    }
  }

  private initializePerformanceObserver() {
    if (!("PerformanceObserver" in window)) return

    // Observe paint timing
    try {
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          logger.info(`Paint metric: ${entry.name}`, {
            duration: entry.startTime,
            entryType: entry.entryType,
          })
        })
      })
      paintObserver.observe({ entryTypes: ["paint"] })
    } catch (e) {
      this.logError("Paint observer error", e as Error)
    }

    // Observe largest contentful paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          logger.info("Largest Contentful Paint", {
            duration: entry.startTime,
            size: (entry as any).size,
            element: (entry as any).element?.tagName,
          })
        })
      })
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] })
    } catch (e) {
      this.logError("LCP observer error", e as Error)
    }

    // Observe layout shifts
    try {
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          logger.info("Layout Shift", {
            value: (entry as any).value,
            sources: (entry as any).sources,
          })
        })
      })
      clsObserver.observe({ entryTypes: ["layout-shift"] })
    } catch (e) {
      this.logError("CLS observer error", e as Error)
    }
  }

  logError(message: string, error: Error, meta?: object) {
    logger.error(message, error, {
      ...meta,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    })
  }

  getPerformanceMetrics(): Partial<PerformanceMetrics> {
    if (typeof window === "undefined") return {}

    const metrics: Partial<PerformanceMetrics> = {}

    // Time to First Byte
    const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
    if (navigationEntry) {
      metrics.timeToFirstByte = navigationEntry.responseStart
    }

    // First Contentful Paint
    const fcpEntry = performance.getEntriesByName("first-contentful-paint")[0]
    if (fcpEntry) {
      metrics.firstContentfulPaint = fcpEntry.startTime
    }

    return metrics
  }
}

export const monitor = new Monitor()