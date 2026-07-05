import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AuthRequest, JwtPayload } from '../types/index'

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Not authorized. No token provided.',
    })
    return
  }

  const token = authHeader.split(' ')[1]
  const secret = process.env.JWT_SECRET

  if (!secret) {
    res.status(500).json({
      success: false,
      message: 'Server configuration error.',
    })
    return
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload
    req.user = { id: decoded.id }
    next()
  } catch (err) {
    // Distinguish between expired and invalid tokens for better UX
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      })
      return
    }
    res.status(401).json({
      success: false,
      message: 'Not authorized. Token is invalid.',
    })
  }
}
