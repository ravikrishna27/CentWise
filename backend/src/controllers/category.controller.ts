import { Response } from 'express'
import { body, validationResult } from 'express-validator'
import { Types } from 'mongoose'
import Category from '../models/Category'
import { asyncHandler } from '../middleware/errorHandler'
import { AuthRequest } from '../types/index'

// ─── Default Categories ───────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = [
  { name: 'Salary',        type: 'income',  color: '#10b981', icon: 'briefcase',    isDefault: true },
  { name: 'Freelance',     type: 'income',  color: '#6366f1', icon: 'laptop',       isDefault: true },
  { name: 'Investment',    type: 'income',  color: '#f59e0b', icon: 'trending-up',  isDefault: true },
  { name: 'Other Income',  type: 'income',  color: '#14b8a6', icon: 'plus-circle',  isDefault: true },
  { name: 'Food',          type: 'expense', color: '#f43f5e', icon: 'utensils',     isDefault: true },
  { name: 'Transport',     type: 'expense', color: '#f97316', icon: 'car',          isDefault: true },
  { name: 'Shopping',      type: 'expense', color: '#8b5cf6', icon: 'shopping-bag', isDefault: true },
  { name: 'Bills',         type: 'expense', color: '#ef4444', icon: 'file-text',    isDefault: true },
  { name: 'Health',        type: 'expense', color: '#06b6d4', icon: 'heart',        isDefault: true },
  { name: 'Entertainment', type: 'expense', color: '#ec4899', icon: 'film',         isDefault: true },
  { name: 'Education',     type: 'expense', color: '#64748b', icon: 'book',         isDefault: true },
  { name: 'Other Expense', type: 'expense', color: '#94a3b8', icon: 'more-horizontal', isDefault: true },
] as const

// ─── Validation ───────────────────────────────────────────────────────────────

export const categoryValidation = [
  body('name').trim().isLength({ min: 1, max: 30 }).withMessage('Name must be 1–30 characters'),
  body('type').isIn(['income', 'expense', 'both']).withMessage('Type must be income, expense, or both'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex code'),
  body('icon').optional().trim().isLength({ max: 50 }),
]

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @route   GET /api/categories
 * @desc    Get all categories for the authenticated user
 * @access  Private
 */
export const getCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
  const categories = await Category.find({ user: req.user!.id }).sort({ type: 1, name: 1 })
  res.json({ success: true, data: categories })
})

/**
 * @route   POST /api/categories
 * @desc    Create a custom category
 * @access  Private
 */
export const createCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => e.msg),
    })
    return
  }

  const { name, type, color, icon } = req.body as {
    name: string
    type: 'income' | 'expense' | 'both'
    color?: string
    icon?: string
  }

  const category = await Category.create({
    user: req.user!.id,
    name,
    type,
    color: color ?? '#4f46e5',
    icon: icon ?? 'tag',
    isDefault: false,
  })

  res.status(201).json({ success: true, data: category })
})

/**
 * @route   PUT /api/categories/:id
 * @desc    Update a custom category (cannot update default categories)
 * @access  Private
 */
export const updateCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => e.msg),
    })
    return
  }

  const category = await Category.findOne({
    _id: req.params.id,
    user: req.user!.id,
  })

  if (!category) {
    res.status(404).json({ success: false, message: 'Category not found.' })
    return
  }

  if (category.isDefault) {
    res.status(403).json({ success: false, message: 'Default categories cannot be modified.' })
    return
  }

  const { name, type, color, icon } = req.body as {
    name?: string
    type?: string
    color?: string
    icon?: string
  }

  if (name !== undefined) category.name = name
  if (type !== undefined) category.type = type as typeof category.type
  if (color !== undefined) category.color = color
  if (icon !== undefined) category.icon = icon

  await category.save()
  res.json({ success: true, data: category })
})

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete a custom category
 * @access  Private
 */
export const deleteCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await Category.findOne({
    _id: req.params.id,
    user: req.user!.id,
  })

  if (!category) {
    res.status(404).json({ success: false, message: 'Category not found.' })
    return
  }

  if (category.isDefault) {
    res.status(403).json({ success: false, message: 'Default categories cannot be deleted.' })
    return
  }

  await category.deleteOne()
  res.json({ success: true, message: 'Category deleted successfully.' })
})

/**
 * @route   POST /api/categories/seed
 * @desc    Seeds default categories for a new user — called internally after registration
 * @access  Internal (called from auth controller, not exposed as a public route)
 */
export const seedDefaultCategories = async (userId: Types.ObjectId | string): Promise<void> => {
  const docs = DEFAULT_CATEGORIES.map((c) => ({ ...c, user: userId }))
  // insertMany with ordered:false continues even if some fail (e.g., duplicates on re-seed)
  await Category.insertMany(docs, { ordered: false }).catch(() => {
    // Silently ignore duplicate key errors on re-seed
  })
}
