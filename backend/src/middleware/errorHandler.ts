import { Request, Response, NextFunction } from 'express'
import { AuthRequest } from '../types/index'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
  code?: number
  errors?: Record<string, { message: string }>
}

/**
 * Central error handler — must be registered LAST in Express middleware chain.
 * Distinguishes between known operational errors and unexpected crashes.
 */
export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode ?? 500
  let message = err.message || 'Internal Server Error'

  // Mongoose duplicate key error (e.g., duplicate email)
  if (err.name === 'MongoServerError' && err.code === 11000) {
    statusCode = 409
    message = 'A record with that value already exists.'
  }

  // Mongoose validation error
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 422
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ')
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400
    message = 'Invalid resource ID format.'
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token.'
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Session expired. Please log in again.'
  }

  const isDev = process.env.NODE_ENV === 'development'

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && { stack: err.stack }),
  })
}

/**
 * Catch-all 404 handler for unmatched routes.
 */
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
}

/**
 * Async wrapper — eliminates try/catch boilerplate in every controller.
 * Accepts both plain Request and the extended AuthRequest.
 */
export const asyncHandler =
  <T extends Request | AuthRequest>(
    fn: (req: T, res: Response, next: NextFunction) => Promise<void>
  ) =>
  (req: T, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
