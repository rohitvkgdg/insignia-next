import { env } from "@/env.mjs"

type LogLevel = "info" | "warn" | "error" | "debug"

interface LogMessage {
  message: string
  level: LogLevel
  timestamp: string
  [key: string]: any
}

class Logger {
  private isDevelopment = env.NODE_ENV === "development"
  private shouldMaskSensitiveData = !this.isDevelopment

  private maskSensitiveData(data: any): any {
    if (!this.shouldMaskSensitiveData || !data) return data
    
    if (typeof data === 'object' && data !== null) {
      const result = Array.isArray(data) ? [...data] : { ...data }
      
      // List of sensitive fields to mask
      const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential', 'access_token', 'refresh_token']
      
      for (const key in result) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          result[key] = '[REDACTED]'
        } else if (typeof result[key] === 'object' && result[key] !== null) {
          result[key] = this.maskSensitiveData(result[key])
        }
      }
      return result
    }
    return data
  }

  private formatMessage(level: LogLevel, message: string, meta?: object): LogMessage {
    const safeMetadata = this.maskSensitiveData(meta)
    
    return {
      message,
      level,
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      ...safeMetadata,
    }
  }

  private log(level: LogLevel, message: string, meta?: object) {
    const formattedMessage = this.formatMessage(level, message, meta)

    if (this.isDevelopment) {
      if (level === "error") {
        console.error(JSON.stringify(formattedMessage, null, 2))
      } else if (level === "warn") {
        console.warn(JSON.stringify(formattedMessage, null, 2))
      } else {
        console.log(JSON.stringify(formattedMessage, null, 2))
      }
      return
    }

    // In production, we still log to console but in a format suitable for log aggregation
    console.log(JSON.stringify(formattedMessage))
    
    // TODO: In a real production environment, send logs to a logging service
    // Example: 
    // - For Vercel, this console.log is already captured
    // - For other hosts, implement a specific logging service integration here
  }

  debug(message: string, meta?: object) {
    if (this.isDevelopment) {
      this.log("debug", message, meta)
    }
  }

  info(message: string, meta?: object) {
    this.log("info", message, meta)
  }

  warn(message: string, meta?: object) {
    this.log("warn", message, meta)
  }

  error(message: string, errorOrMeta?: Error | object, meta?: object) {
    if (errorOrMeta instanceof Error) {
      this.log("error", message, {
        ...meta,
        error: {
          message: errorOrMeta.message,
          stack: errorOrMeta.stack,
          name: errorOrMeta.name,
        },
      })
    } else {
      this.log("error", message, errorOrMeta)
    }
  }
}

export const logger = new Logger()