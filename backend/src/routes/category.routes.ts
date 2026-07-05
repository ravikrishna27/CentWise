import { Router } from 'express'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  categoryValidation,
} from '../controllers/category.controller'
import { protect } from '../middleware/auth'

const router = Router()

// All category routes require authentication
router.use(protect)

// GET    /api/categories
router.get('/', getCategories)

// POST   /api/categories
router.post('/', categoryValidation, createCategory)

// PUT    /api/categories/:id
router.put('/:id', categoryValidation, updateCategory)

// DELETE /api/categories/:id
router.delete('/:id', deleteCategory)

export default router
