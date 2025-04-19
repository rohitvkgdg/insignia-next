import { env } from "@/env.mjs"
import { logger } from "./logger"

interface PerformanceMetrics {
  timeToFirstByte: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  firstInputDelay: number
  cumulativeLayoutShift: number
  timeToInteractive: number
  resourceLoadTime: Record<string, number>
  memoryUsage?: {
    jsHeapSizeLimit: number
    totalJSHeapSize: number
    usedJSHeapSize: number
  }
}

// Configuration for performance thresholds (milliseconds)
const PERFORMANCE_THRESHOLDS = {
  TTFB: 600,            // Time to First Byte
  FCP: 1800,            // First Contentful Paint
  LCP: 2500,            // Largest Contentful Paint
  TTI: 3800,            // Time to Interactive
  FID: 100,             // First Input Delay
  CLS_THRESHOLD: 0.1    // Cumulative Layout Shift
}

class Monitor {
  private isDevelopment = env.NODE_ENV === "development"
  private metricsCollected = false
  private cumulativeLayoutShift = 0
  private lastLCP = 0

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeErrorHandlers()
      this.initializePerformanceObserver()
      this.setupPageLifecycleMonitoring()
    }
  }

  private initializeErrorHandlers() {
    window.onerror = (message, source, lineno, colno, error) => {
      this.logError("Uncaught error", error ?? new Error(String(message)), {
        source,
        lineno,
        colno,
      })
      return false // Allow default error handling to continue
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
          const metric = {
            name: entry.name,
            duration: entry.startTime,
            entryType: entry.entryType,
          }
          
          logger.info(`Paint metric: ${entry.name}`, metric)
          
          // Check against thresholds and report issues
          if (entry.name === 'first-contentful-paint' && 
              entry.startTime > PERFORMANCE_THRESHOLDS.FCP) {
            logger.warn('First Contentful Paint exceeds threshold', {
              value: entry.startTime,
              threshold: PERFORMANCE_THRESHOLDS.FCP,
              url: window.location.pathname
            })
          }
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
        const lastEntry = entries[entries.length - 1] as any
        if (lastEntry) {
          this.lastLCP = lastEntry.startTime
          
          const metric = {
            duration: lastEntry.startTime,
            size: lastEntry.size,
            element: lastEntry.element?.tagName,
          }
          
          logger.info("Largest Contentful Paint", metric)
          
          // Check against threshold
          if (lastEntry.startTime > PERFORMANCE_THRESHOLDS.LCP) {
            logger.warn('Largest Contentful Paint exceeds threshold', {
              value: lastEntry.startTime,
              threshold: PERFORMANCE_THRESHOLDS.LCP,
              url: window.location.pathname
            })
          }
        }
      })
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] })
    } catch (e) {
      this.logError("LCP observer error", e as Error)
    }

    // Observe layout shifts
    try {
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          // Only count layout shifts without recent user input
          if (!entry.hadRecentInput) {
            this.cumulativeLayoutShift += entry.value
            
            if (this.cumulativeLayoutShift > PERFORMANCE_THRESHOLDS.CLS_THRESHOLD) {
              logger.warn('Cumulative Layout Shift exceeds threshold', {
                value: this.cumulativeLayoutShift,
                threshold: PERFORMANCE_THRESHOLDS.CLS_THRESHOLD,
                url: window.location.pathname
              })
            }
          }
        })
      })
      clsObserver.observe({ entryTypes: ["layout-shift"] })
    } catch (e) {
      this.logError("CLS observer error", e as Error)
    }

    // Observe first input delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          const metric = {
            duration: entry.processingStart - entry.startTime,
            startTime: entry.startTime,
            name: entry.name,
          }
          
          logger.info("First Input Delay", metric)
          
          if ((entry.processingStart - entry.startTime) > PERFORMANCE_THRESHOLDS.FID) {
            logger.warn('First Input Delay exceeds threshold', {
              value: entry.processingStart - entry.startTime,
              threshold: PERFORMANCE_THRESHOLDS.FID,
              url: window.location.pathname
            })
          }
        })
      })
      fidObserver.observe({ entryTypes: ["first-input"], buffered: true })
    } catch (e) {
      this.logError("FID observer error", e as Error)
    }

    // Monitor resource loading
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          // Only log resources that take longer than 1 second
          if (entry.duration > 1000) {
            logger.warn("Slow resource load", {
              name: entry.name,
              duration: entry.duration,
              type: entry.initiatorType,
              size: (entry as any).transferSize || 0,
            })
          }
        })
      })
      resourceObserver.observe({ entryTypes: ["resource"] })
    } catch (e) {
      this.logError("Resource observer error", e as Error)
    }
  }

  private setupPageLifecycleMonitoring() {
    // Send metrics when the user is about to leave the page
    window.addEventListener('beforeunload', () => {
      // Only collect once per page view
      if (!this.metricsCollected) {
        this.reportAllMetrics()
        this.metricsCollected = true
      }
    })

    // Also collect when the page becomes hidden (user switches tabs)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && !this.metricsCollected) {
        this.reportAllMetrics()
        this.metricsCollected = true
      }
    })

    // Collect metrics after page has loaded and idle (non-blocking)
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        // Wait until most metrics would be available
        setTimeout(() => {
          if (!this.metricsCollected) {
            this.reportAllMetrics()
            this.metricsCollected = true
          }
        }, 5000) 
      })
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(() => {
        if (!this.metricsCollected) {
          this.reportAllMetrics()
          this.metricsCollected = true
        }
      }, 6000)
    }
  }

  logError(message: string, error: Error, meta?: object) {
    logger.error(message, error, {
      ...meta,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    })
  }

  private reportAllMetrics() {
    const metrics = this.getPerformanceMetrics()
    logger.info("Page Performance Metrics", metrics)
    
    // Send metrics to analytics or monitoring service in production
    if (env.NODE_ENV === "production") {
      // Example implementation:
      // fetch('/api/metrics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ metrics, path: window.location.pathname }),
      //   // Use keepalive to ensure the request completes even if the page unloads
      //   keepalive: true
      // }).catch(e => console.error('Failed to report metrics:', e))
    }
  }

  getPerformanceMetrics(): Partial<PerformanceMetrics> {
    if (typeof window === "undefined") return {}

    const metrics: Partial<PerformanceMetrics> = {}

    // Navigation timing metrics
    const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
    if (navigationEntry) {
      metrics.timeToFirstByte = navigationEntry.responseStart
      
      // Calculate resource timing
      metrics.resourceLoadTime = {
        'dns': navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart,
        'connection': navigationEntry.connectEnd - navigationEntry.connectStart,
        'request': navigationEntry.responseStart - navigationEntry.requestStart,
        'response': navigationEntry.responseEnd - navigationEntry.responseStart,
        'dom': navigationEntry.domComplete - navigationEntry.domInteractive,
        'load': navigationEntry.loadEventEnd - navigationEntry.loadEventStart
      }
    }

    // Paint metrics
    const paintEntries = performance.getEntriesByType('paint')
    for (const entry of paintEntries) {
      if (entry.name === 'first-contentful-paint') {
        metrics.firstContentfulPaint = entry.startTime
      }
    }

    // Add LCP from our observer
    if (this.lastLCP) {
      metrics.largestContentfulPaint = this.lastLCP
    }
    
    // CLS
    metrics.cumulativeLayoutShift = this.cumulativeLayoutShift

    // Memory info if available
    if (performance.memory) {
      metrics.memoryUsage = {
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize
      }
    }

    // Calculate TTI approximation (not accurate but a useful estimate)
    if (navigationEntry && metrics.firstContentfulPaint) {
      // A simple heuristic: FCP + time until network is quiet
      metrics.timeToInteractive = metrics.firstContentfulPaint + 
        (navigationEntry.loadEventEnd - metrics.firstContentfulPaint)
    }

    return metrics
  }
}

export const monitor = new Monitor()