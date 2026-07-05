import { Router } from 'express'
import {
  getTransactions,
  getSummary,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  transactionValidation,
} from '../controllers/transaction.controller'
import { protect } from '../middleware/auth'

const router = Router()

// All transaction routes require authentication
router.use(protect)

// GET  /api/transactions/summary  ← MUST be before /:id to avoid being treated as an ID
router.get('/summary', getSummary)

// GET  /api/transactions
router.get('/', getTransactions)

// POST /api/transactions
router.post('/', transactionValidation, createTransaction)

// GET  /api/transactions/:id
router.get('/:id', getTransactionById)

// PUT  /api/transactions/:id
router.put('/:id', transactionValidation, updateTransaction)

// DELETE /api/transactions/:id
router.delete('/:id', deleteTransaction)

export default router
