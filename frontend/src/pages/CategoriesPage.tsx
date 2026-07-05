import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, Tag, AlertCircle } from 'lucide-react'
import { categoriesApi } from '../api/axios'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { CategoryModal } from '../components/categories/CategoryModal'

interface Category {
  _id: string
  name: string
  type: 'income' | 'expense' | 'both'
  color: string
  icon: string
  isDefault: boolean
}

export function CategoriesPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoriesApi.getAll()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return res.data.data as Category[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingCategory(null)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
        <LoadingSpinner size="lg" label="Loading categories…" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="alert alert-error">
        <AlertCircle size={16} style={{ marginTop: '2px' }} />
        <p>Failed to load categories. Please refresh the page.</p>
      </div>
    )
  }

  const categories = data ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus size={16} />
          Add Category
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}
      >
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="card"
            style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: `${cat.color}20`,
                  color: cat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Tag size={18} />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 0.125rem' }}>
                  {cat.name}
                </p>
                <span className={`badge ${cat.type === 'income' ? 'badge-income' : 'badge-expense'}`} style={{ fontSize: '0.6875rem' }}>
                  {cat.type.charAt(0).toUpperCase() + cat.type.slice(1)}
                </span>
              </div>
            </div>

            {!cat.isDefault && (
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '0.375rem' }}
                  onClick={() => handleEdit(cat)}
                  aria-label="Edit category"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '0.375rem', color: 'var(--color-expense)' }}
                  onClick={() => handleDelete(cat._id)}
                  aria-label="Delete category"
                  disabled={deleteMutation.isPending && deleteMutation.variables === cat._id}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )}
          </div>
        ))}

        {categories.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <Tag size={40} className="empty-state-icon" />
            <p>No categories found.</p>
          </div>
        )}
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
      />
    </div>
  )
}
