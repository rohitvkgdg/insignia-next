import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function handleError(error: unknown) {
  if (error instanceof ApiError) {
    return new Response(
      JSON.stringify({
        code: error.code ?? "ERROR",
        message: error.message
      }),
      {
        status: error.statusCode,
        headers: { "Content-Type": "application/json" },
      }
    )
  }

  console.error(error)
  return new Response(
    JSON.stringify({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred"
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }
  )
}
