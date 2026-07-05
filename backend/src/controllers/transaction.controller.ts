import { Response } from 'express'
import { body, query, validationResult } from 'express-validator'
import { Types } from 'mongoose'
import Transaction from '../models/Transaction'
import { asyncHandler } from '../middleware/errorHandler'
import { AuthRequest } from '../types/index'

// ─── Validation ───────────────────────────────────────────────────────────────

export const transactionValidation = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  body('category').isMongoId().withMessage('Category must be a valid ID'),
  body('note').optional().trim().isLength({ max: 500 }).withMessage('Note cannot exceed 500 characters'),
]

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions for the user with optional filtering/pagination
 * @access  Private
 * @query   type, category, startDate, endDate, page, limit
 */
export const getTransactions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    type,
    category,
    startDate,
    endDate,
    page = '1',
    limit = '20',
  } = req.query as Record<string, string>

  // Build query filter
  const filter: Record<string, unknown> = { user: req.user!.id }

  if (type === 'income' || type === 'expense') filter.type = type
  if (category) filter.category = category
  if (startDate || endDate) {
    filter.date = {}
    if (startDate) (filter.date as Record<string, Date>).$gte = new Date(startDate)
    if (endDate) (filter.date as Record<string, Date>).$lte = new Date(endDate)
  }

  const pageNum = Math.max(1, parseInt(page, 10))
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)))
  const skip = (pageNum - 1) * limitNum

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate('category', 'name color icon type')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Transaction.countDocuments(filter),
  ])

  res.json({
    success: true,
    data: transactions,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  })
})

/**
 * @route   GET /api/transactions/summary
 * @desc    Dashboard summary: totals + monthly chart data
 * @access  Private
 * @query   year, month (defaults to current month)
 */
export const getSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const now = new Date()
  const year = parseInt((req.query.year as string) ?? String(now.getFullYear()), 10)
  const month = parseInt((req.query.month as string) ?? String(now.getMonth() + 1), 10)

  // Current month boundaries
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 0, 23, 59, 59, 999)

  const userId = req.user!.id

  // ── Monthly income / expense totals ──────────────────────────────────────
  const monthlySummary = await Transaction.aggregate([
    {
      $match: {
        user: new Types.ObjectId(userId),
        date: { $gte: monthStart, $lte: monthEnd },
      },
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ])

  const income = monthlySummary.find((s) => s._id === 'income')?.total ?? 0
  const expenses = monthlySummary.find((s) => s._id === 'expense')?.total ?? 0

  // ── All-time total balance ────────────────────────────────────────────────
  const balanceSummary = await Transaction.aggregate([
    { $match: { user: new Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ])

  const totalIncome = balanceSummary.find((s) => s._id === 'income')?.total ?? 0
  const totalExpenses = balanceSummary.find((s) => s._id === 'expense')?.total ?? 0

  // ── Last 6 months chart data ──────────────────────────────────────────────
  const sixMonthsAgo = new Date(year, month - 7, 1)  // 6 months before current

  const chartData = await Transaction.aggregate([
    {
      $match: {
        user: new Types.ObjectId(userId),
        date: { $gte: sixMonthsAgo, $lte: monthEnd },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ])

  // Transform chart data into a shape ready for Recharts
  const monthsMap = new Map<string, { month: string; income: number; expenses: number }>()

  chartData.forEach((entry) => {
    const key = `${entry._id.year}-${String(entry._id.month).padStart(2, '0')}`
    const label = new Date(entry._id.year, entry._id.month - 1).toLocaleString('default', {
      month: 'short',
      year: '2-digit',
    })
    if (!monthsMap.has(key)) {
      monthsMap.set(key, { month: label, income: 0, expenses: 0 })
    }
    const record = monthsMap.get(key)!
    if (entry._id.type === 'income') record.income = entry.total
    else record.expenses = entry.total
  })

  const chartDataFormatted = Array.from(monthsMap.values())

  // ── Spending by category (current month) ─────────────────────────────────
  const categoryBreakdown = await Transaction.aggregate([
    {
      $match: {
        user: new Types.ObjectId(userId),
        type: 'expense',
        date: { $gte: monthStart, $lte: monthEnd },
      },
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'categoryInfo',
      },
    },
    { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: false } },
    { $sort: { total: -1 } },
    { $limit: 8 },
  ])

  const categoryBreakdownFormatted = categoryBreakdown.map((entry) => ({
    categoryId: entry._id,
    categoryName: entry.categoryInfo.name as string,
    categoryColor: entry.categoryInfo.color as string,
    total: entry.total as number,
    percentage: expenses > 0 ? Math.round((entry.total / expenses) * 100) : 0,
  }))

  res.json({
    success: true,
    data: {
      balance: totalIncome - totalExpenses,
      totalIncome,
      totalExpenses,
      monthly: {
        income,
        expenses,
        balance: income - expenses,
        transactionCount:
          (monthlySummary.find((s) => s._id === 'income')?.count ?? 0) +
          (monthlySummary.find((s) => s._id === 'expense')?.count ?? 0),
      },
      chartData: chartDataFormatted,
      categoryBreakdown: categoryBreakdownFormatted,
    },
  })
})

/**
 * @route   GET /api/transactions/:id
 * @desc    Get a single transaction by ID
 * @access  Private
 */
export const getTransactionById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    user: req.user!.id,
  }).populate('category', 'name color icon type')

  if (!transaction) {
    res.status(404).json({ success: false, message: 'Transaction not found.' })
    return
  }

  res.json({ success: true, data: transaction })
})

/**
 * @route   POST /api/transactions
 * @desc    Create a new transaction
 * @access  Private
 */
export const createTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => e.msg),
    })
    return
  }

  const { type, amount, date, category, note } = req.body as {
    type: 'income' | 'expense'
    amount: number
    date: string
    category: string
    note?: string
  }

  const transaction = await Transaction.create({
    user: req.user!.id,
    type,
    amount,
    date: new Date(date),
    category,
    note,
  })

  const populated = await transaction.populate('category', 'name color icon type')
  res.status(201).json({ success: true, data: populated })
})

/**
 * @route   PUT /api/transactions/:id
 * @desc    Update a transaction
 * @access  Private
 */
export const updateTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => e.msg),
    })
    return
  }

  const transaction = await Transaction.findOne({
    _id: req.params.id,
    user: req.user!.id,
  })

  if (!transaction) {
    res.status(404).json({ success: false, message: 'Transaction not found.' })
    return
  }

  const { type, amount, date, category, note } = req.body as {
    type?: 'income' | 'expense'
    amount?: number
    date?: string
    category?: string
    note?: string
  }

  if (type !== undefined) transaction.type = type
  if (amount !== undefined) transaction.amount = amount
  if (date !== undefined) transaction.date = new Date(date)
  if (category !== undefined) transaction.category = category as unknown as import('mongoose').Types.ObjectId
  if (note !== undefined) transaction.note = note

  await transaction.save()
  const populated = await transaction.populate('category', 'name color icon type')
  res.json({ success: true, data: populated })
})

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete a transaction
 * @access  Private
 */
export const deleteTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    user: req.user!.id,
  })

  if (!transaction) {
    res.status(404).json({ success: false, message: 'Transaction not found.' })
    return
  }

  await transaction.deleteOne()
  res.json({ success: true, message: 'Transaction deleted successfully.' })
})
