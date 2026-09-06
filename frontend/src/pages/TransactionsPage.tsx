import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, AlertCircle, FileText, X } from 'lucide-react'
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

// Accessible inline confirmation — replaces window.confirm()
function DeleteConfirmation({
  transaction,
  onConfirm,
  onCancel,
  isPending,
}: {
  transaction: Transaction
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}) {
  const label = transaction.note
    ? `${transaction.category.name} — ${transaction.note}`
    : transaction.category.name

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
      aria-describedby="delete-confirm-desc"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 100,
        padding: '1rem',
      }}
    >
      <div
        className="modal"
        style={{ maxWidth: '380px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="delete-confirm-title" className="modal-title">Delete Transaction</h2>
          <button
            className="btn btn-ghost"
            style={{ padding: '0.25rem' }}
            onClick={onCancel}
            aria-label="Cancel deletion"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <p id="delete-confirm-desc" style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          Are you sure you want to delete <strong>{label}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" className="btn btn-ghost" onClick={onCancel} autoFocus>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isPending}
            aria-disabled={isPending}
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function TransactionsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)

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
      setDeletingTransaction(null)
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

  const handleDeleteRequest = (tx: Transaction) => {
    setDeletingTransaction(tx)
  }

  const handleDeleteConfirm = () => {
    if (deletingTransaction) deleteMutation.mutate(deletingTransaction._id)
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
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Filter select — properly labelled for screen readers */}
          <label htmlFor="tx-type-filter" className="sr-only">Filter by type</label>
          <select
            id="tx-type-filter"
            className="input"
            style={{ width: 'auto', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as '' | 'income' | 'expense')
              setPage(1)
            }}
            aria-label="Filter transactions by type"
          >
            <option value="">All Types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleAdd} aria-label="Add new transaction">
          <Plus size={16} aria-hidden="true" />
          Add Transaction
        </button>
      </div>

      {/* ── Loading & Error States ─────────────────────────────────────────── */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
          <LoadingSpinner size="lg" label="Loading transactions…" />
        </div>
      ) : isError ? (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={16} style={{ marginTop: '2px' }} aria-hidden="true" />
          <p>Failed to load transactions. Please refresh the page.</p>
        </div>
      ) : (
        <>
          {/* ── Transactions Table ───────────────────────────────────────────── */}
          <div className="table-wrapper">
            <table aria-label="Transactions list">
              <caption className="sr-only">
                Your transactions{typeFilter ? ` (filtered: ${typeFilter}s)` : ''}, page {page}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Category</th>
                  <th scope="col">Note</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Amount</th>
                  <th scope="col" style={{ textAlign: 'right', width: '100px' }}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.data.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                        <FileText size={32} className="empty-state-icon" aria-hidden="true" />
                        <p>No transactions found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data?.data.map((tx) => {
                    const txLabel = tx.note
                      ? `${tx.category.name} — ${tx.note}`
                      : tx.category.name
                    return (
                      <tr key={tx._id}>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <time dateTime={tx.date}>
                            {format(new Date(tx.date), 'MMM d, yyyy')}
                          </time>
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
                          {tx.note || <span style={{ color: 'var(--color-text-muted)' }} aria-hidden="true">—</span>}
                        </td>
                        <td
                          style={{ textAlign: 'right', fontWeight: 500, color: tx.type === 'income' ? 'var(--color-income)' : 'var(--color-text-primary)' }}
                          aria-label={`${tx.type === 'income' ? 'Income' : 'Expense'}: ${formatCurrency(tx.amount)}`}
                        >
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                            <button
                              className="btn btn-ghost"
                              style={{ padding: '0.375rem' }}
                              onClick={() => handleEdit(tx)}
                              aria-label={`Edit ${txLabel}`}
                            >
                              <Edit2 size={15} aria-hidden="true" />
                            </button>
                            <button
                              className="btn btn-ghost"
                              style={{ padding: '0.375rem', color: 'var(--color-expense)' }}
                              onClick={() => handleDeleteRequest(tx)}
                              aria-label={`Delete ${txLabel}`}
                            >
                              <Trash2 size={15} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination Controls ──────────────────────────────────────────── */}
          {data && data.totalPages > 1 && (
            <nav aria-label="Pagination" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                className="btn btn-ghost"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                aria-label="Go to previous page"
              >
                Previous
              </button>
              <span
                aria-live="polite"
                aria-atomic="true"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}
              >
                Page {page} of {data.totalPages}
              </span>
              <button
                className="btn btn-ghost"
                disabled={page === data.totalPages}
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                aria-label="Go to next page"
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}

      {/* ── Accessible Delete Confirmation ─────────────────────────────────── */}
      {deletingTransaction && (
        <DeleteConfirmation
          transaction={deletingTransaction}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingTransaction(null)}
          isPending={deleteMutation.isPending}
        />
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
