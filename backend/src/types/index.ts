import { Request } from 'express'
import { Types } from 'mongoose'

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  id: string
  iat?: number
  exp?: number
}

export interface AuthRequest extends Request {
  user?: {
    id: string
  }
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface IUser {
  _id: Types.ObjectId
  name: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

// ─── Category ─────────────────────────────────────────────────────────────────

// Single source of truth — models import from here, not redefine
export type CategoryType = 'income' | 'expense' | 'both'

export interface ICategory {
  _id: Types.ObjectId
  user: Types.ObjectId
  name: string
  type: CategoryType
  color: string
  icon: string
  isDefault: boolean   // was missing before
  createdAt: Date
  updatedAt: Date
}

// ─── Transaction ──────────────────────────────────────────────────────────────

// Single source of truth — models import from here, not redefine
export type TransactionType = 'income' | 'expense'

export interface ITransaction {
  _id: Types.ObjectId
  user: Types.ObjectId
  type: TransactionType
  amount: number
  date: Date
  category: Types.ObjectId | ICategory
  note?: string
  createdAt: Date
  updatedAt: Date
}

// ─── API Response Shapes ──────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  limit: number
}

// ─── Dashboard Summary ────────────────────────────────────────────────────────

export interface MonthlySummary {
  totalIncome: number
  totalExpenses: number
  balance: number
  transactionCount: number
}

export interface SpendingByCategory {
  categoryId: string
  categoryName: string
  categoryColor: string
  total: number
  percentage: number
}
