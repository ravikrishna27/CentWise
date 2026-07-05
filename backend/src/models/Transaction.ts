import { Schema, model, Document, Types } from 'mongoose'
import { TransactionType } from '../types/index'  // single source of truth

export type { TransactionType }

export interface ITransactionDocument extends Document {
  user: Types.ObjectId
  type: TransactionType
  amount: number
  date: Date
  category: Types.ObjectId
  note?: string
  createdAt: Date
  updatedAt: Date
}

const transactionSchema = new Schema<ITransactionDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: ['income', 'expense'],
        message: 'Transaction type must be income or expense',
      },
      required: [true, 'Transaction type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
)

// Composite indexes for efficient per-user date-range queries (used by dashboard)
transactionSchema.index({ user: 1, date: -1 })
transactionSchema.index({ user: 1, type: 1, date: -1 })

const Transaction = model<ITransactionDocument>('Transaction', transactionSchema)
export default Transaction
