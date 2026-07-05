import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, AlertCircle, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { transactionsApi } from '../api/axios'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { TransactionModal } from '../components/transactions/TransactionModal'

interface Transaction {
  _id: string
  type: 'income' | 'expense'
  amount: number
  date: string
  category: { _id: string; name: string; color: string; icon: string }
  note?: string
}

export function TransactionsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  
  // Filtering & Pagination state
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<'' | 'income' | 'expense'>('')
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['transactions', page, typeFilter],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit: 15 }
      if (typeFilter) params.type = typeFilter
      
      const res = await transactionsApi.getAll(params)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return res.data as { data: Transaction[]; totalPages: number; page: number }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionsApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['transactions'] })
      void queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingTransaction(null)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteMutation.mutate(id)
    }
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ── Header Actions ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            className="input"
            style={{ width: 'auto', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as any)
              setPage(1) // reset page on filter change
            }}
          >
            <option value="">All Types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus size={16} />
          Add Transaction
        </button>
      </div>

      {/* ── Loading & Error States ─────────────────────────────────────────── */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
          <LoadingSpinner size="lg" label="Loading transactions…" />
        </div>
      ) : isError ? (
        <div className="alert alert-error">
          <AlertCircle size={16} style={{ marginTop: '2px' }} />
          <p>Failed to load transactions. Please refresh the page.</p>
        </div>
      ) : (
        <>
          {/* ── Transactions Table ───────────────────────────────────────────── */}
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Note</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'right', width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                        <FileText size={32} className="empty-state-icon" />
                        <p>No transactions found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data?.data.map((tx) => (
                    <tr key={tx._id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {format(new Date(tx.date), 'MMM d, yyyy')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: tx.category.color,
                            }}
                            aria-hidden="true"
                          />
                          {tx.category.name}
                        </div>
                      </td>
                      <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {tx.note || <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 500, color: tx.type === 'income' ? 'var(--color-income)' : 'var(--color-text-primary)' }}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: '0.375rem' }}
                            onClick={() => handleEdit(tx)}
                            aria-label="Edit transaction"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: '0.375rem', color: 'var(--color-expense)' }}
                            onClick={() => handleDelete(tx._id)}
                            aria-label="Delete transaction"
                            disabled={deleteMutation.isPending && deleteMutation.variables === tx._id}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination Controls ──────────────────────────────────────────── */}
          {data && data.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                className="btn btn-ghost"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                Page {page} of {data.totalPages}
              </span>
              <button
                className="btn btn-ghost"
                disabled={page === data.totalPages}
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Transaction Modal ──────────────────────────────────────────────── */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={editingTransaction}
      />
    </div>
  )
}
