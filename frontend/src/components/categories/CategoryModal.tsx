import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { categoriesApi } from '../../api/axios'
import { useFocusTrap } from '../../hooks/useFocusTrap'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category?: {
    _id: string
    name: string
    type: 'income' | 'expense' | 'both'
    color: string
    icon: string
  } | null
}

const PRESET_COLORS = [
  { hex: '#4f46e5', name: 'Indigo' },
  { hex: '#10b981', name: 'Emerald' },
  { hex: '#f43f5e', name: 'Rose' },
  { hex: '#f59e0b', name: 'Amber' },
  { hex: '#6366f1', name: 'Violet' },
  { hex: '#14b8a6', name: 'Teal' },
  { hex: '#f97316', name: 'Orange' },
  { hex: '#8b5cf6', name: 'Purple' },
  { hex: '#ec4899', name: 'Pink' },
  { hex: '#06b6d4', name: 'Cyan' },
  { hex: '#64748b', name: 'Slate' },
  { hex: '#3b82f6', name: 'Blue' },
]

export function CategoryModal({ isOpen, onClose, category }: CategoryModalProps) {
  const queryClient = useQueryClient()
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = 'category-modal-title'

  // Trap focus inside modal; Escape key calls onClose
  useFocusTrap(dialogRef, isOpen, onClose)

  const [name, setName] = useState('')
  const [type, setType] = useState<'income' | 'expense' | 'both'>('expense')
  const [color, setColor] = useState('#4f46e5')

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name)
        setType(category.type)
        setColor(category.color)
      } else {
        setName('')
        setType('expense')
        setColor('#4f46e5')
      }
    }
  }, [isOpen, category])

  const mutation = useMutation({
    mutationFn: (data: { name: string; type: string; color: string; icon: string }) => {
      if (category) {
        return categoriesApi.update(category._id, data)
      }
      return categoriesApi.create(data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] })
      onClose()
    }
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    mutation.mutate({ name: name.trim(), type, color, icon: 'tag' })
  }

  return (
    // Overlay — clicking outside closes the dialog
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Dialog container */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id={titleId} className="modal-title">
            {category ? 'Edit Category' : 'New Category'}
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: '0.25rem' }}
            aria-label="Close dialog"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <div className="form-field">
              <label htmlFor="cat-name" className="label">Name</label>
              <input
                id="cat-name"
                type="text"
                className="input"
                placeholder="e.g. Groceries"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                aria-required="true"
                maxLength={30}
              />
            </div>

            <div className="form-field">
              <label htmlFor="cat-type" className="label">Type</label>
              <select
                id="cat-type"
                className="input"
                value={type}
                onChange={(e) => setType(e.target.value as typeof type)}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="both">Both</option>
              </select>
            </div>

            {/* Color picker — uses fieldset + legend for screen readers */}
            <fieldset style={{ border: 'none', padding: 0 }}>
              <legend className="label" style={{ marginBottom: '0.375rem' }}>Color</legend>
              <div
                role="radiogroup"
                aria-label="Choose category color"
                style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}
              >
                {PRESET_COLORS.map(({ hex, name: colorName }) => (
                  <button
                    key={hex}
                    type="button"
                    role="radio"
                    aria-checked={color === hex}
                    onClick={() => setColor(hex)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: hex,
                      border: color === hex ? '2px solid var(--color-text-primary)' : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'transform 0.1s ease',
                      transform: color === hex ? 'scale(1.2)' : 'scale(1)',
                    }}
                    aria-label={`${colorName}${color === hex ? ' (selected)' : ''}`}
                  />
                ))}
              </div>
            </fieldset>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={mutation.isPending}
              aria-disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Saving…' : 'Save Category'}
            </button>
          </div>

          {/* Live region: announced automatically by screen readers on error */}
          {mutation.isError && (
            <p
              role="alert"
              style={{ color: 'var(--color-expense)', fontSize: '0.8125rem', marginTop: '1rem', textAlign: 'center' }}
            >
              Failed to save category. Please try again.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
