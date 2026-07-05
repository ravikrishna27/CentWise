import { Schema, model, Document, Types } from 'mongoose'
import { CategoryType } from '../types/index'  // single source of truth

export type { CategoryType }

export interface ICategoryDocument extends Document {
  user: Types.ObjectId
  name: string
  type: CategoryType
  color: string
  icon: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

const categorySchema = new Schema<ICategoryDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [30, 'Category name cannot exceed 30 characters'],
    },
    type: {
      type: String,
      enum: {
        values: ['income', 'expense', 'both'],
        message: 'Type must be income, expense, or both',
      },
      required: [true, 'Category type is required'],
    },
    color: {
      type: String,
      default: '#4f46e5',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color must be a valid hex code'],
    },
    icon: {
      type: String,
      default: 'tag',
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index: a user cannot have two categories with the same name
categorySchema.index({ user: 1, name: 1 }, { unique: true })

const Category = model<ICategoryDocument>('Category', categorySchema)
export default Category
