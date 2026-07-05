import { Response } from 'express'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import User from '../models/User'
import { seedDefaultCategories } from './category.controller'
import { asyncHandler } from '../middleware/errorHandler'
import { AuthRequest } from '../types/index'

// ─── Helper ───────────────────────────────────────────────────────────────────

const signToken = (id: string): string => {
  const secret = process.env.JWT_SECRET!
  const expiresIn = process.env.JWT_EXPIRES_IN ?? '7d'
  return jwt.sign({ id }, secret, { expiresIn } as jwt.SignOptions)
}

const sendTokenResponse = (
  res: Response,
  statusCode: number,
  user: { _id: unknown; name: string; email: string }
): void => {
  const token = signToken(String(user._id))
  res.status(statusCode).json({
    success: true,
    token,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  })
}

// ─── Validation Rules ─────────────────────────────────────────────────────────

export const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
]

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Check validation results
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => e.msg),
    })
    return
  }

  const { name, email, password } = req.body as {
    name: string
    email: string
    password: string
  }

  // Check for existing user
  const existing = await User.findOne({ email })
  if (existing) {
    res.status(409).json({
      success: false,
      message: 'An account with that email already exists.',
    })
    return
  }

  const user = await User.create({ name, email, password })

  // Seed default categories for this new user (non-blocking)
  seedDefaultCategories(user._id).catch((err: unknown) =>
    console.error('Failed to seed categories:', err)
  )

  sendTokenResponse(res, 201, user)
})

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT
 * @access  Public
 */
export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => e.msg),
    })
    return
  }

  const { email, password } = req.body as { email: string; password: string }

  // Explicitly select password (excluded by default via `select: false`)
  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
    })
    return
  }

  sendTokenResponse(res, 200, user)
})

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user's profile
 * @access  Private
 */
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id)

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' })
    return
  }

  res.json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: (user as unknown as { createdAt: Date }).createdAt,
    },
  })
})
