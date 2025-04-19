import { env } from "@/env.mjs"

type LogLevel = "info" | "warn" | "error"

interface LogMessage {
  message: string
  level: LogLevel
  timestamp: string
  [key: string]: any
}

class Logger {
  private isDevelopment = env.NODE_ENV === "development"

  private formatMessage(level: LogLevel, message: string, meta?: object): LogMessage {
    return {
      message,
      level,
      timestamp: new Date().toISOString(),
      ...meta,
    }
  }

  private log(level: LogLevel, message: string, meta?: object) {
    const formattedMessage = this.formatMessage(level, message, meta)

    if (this.isDevelopment) {
      if (level === "error") {
        console.error(formattedMessage)
      } else if (level === "warn") {
        console.warn(formattedMessage)
      } else {
        console.log(formattedMessage)
      }
      return
    }

    // In production, you would typically send this to a logging service
    // Example: await fetch("your-logging-service", { method: "POST", body: JSON.stringify(formattedMessage) })
    
    // For now, we'll just use console in production, but you should replace this
    // with your preferred logging service (e.g., Sentry, LogRocket, etc.)
    if (level === "error") {
      console.error(formattedMessage)
    }
  }

  info(message: string, meta?: object) {
    this.log("info", message, meta)
  }

  warn(message: string, meta?: object) {
    this.log("warn", message, meta)
  }

  error(message: string, error?: Error, meta?: object) {
    this.log("error", message, {
      ...meta,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : undefined,
    })
  }
}

export const logger = new Logger()