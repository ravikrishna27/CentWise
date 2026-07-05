import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { categoriesApi } from '../../api/axios'

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
  '#4f46e5', '#10b981', '#f43f5e', '#f59e0b',
  '#6366f1', '#14b8a6', '#f97316', '#8b5cf6',
  '#ec4899', '#06b6d4', '#64748b', '#3b82f6'
]

export function CategoryModal({ isOpen, onClose, category }: CategoryModalProps) {
  const queryClient = useQueryClient()
  
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
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{category ? 'Edit Category' : 'New Category'}</h2>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.25rem' }}>
            <X size={20} />
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

            <div className="form-field">
              <label className="label">Color</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: c,
                      border: color === c ? '2px solid var(--color-text-primary)' : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'transform 0.1s ease',
                      transform: color === c ? 'scale(1.1)' : 'scale(1)',
                    }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save Category'}
            </button>
          </div>
          {mutation.isError && (
            <p style={{ color: 'var(--color-expense)', fontSize: '0.8125rem', marginTop: '1rem', textAlign: 'center' }}>
              Failed to save category. Please try again.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
