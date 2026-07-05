import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { transactionsApi, categoriesApi } from '../../api/axios'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction?: {
    _id: string
    type: 'income' | 'expense'
    amount: number
    date: string
    category: { _id: string; name: string } | string
    note?: string
  } | null
}

export function TransactionModal({ isOpen, onClose, transaction }: TransactionModalProps) {
  const queryClient = useQueryClient()
  
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState('')
  const [note, setNote] = useState('')

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
    enabled: isOpen,
  })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const categories = (categoriesRes?.data?.data as Array<{ _id: string; name: string; type: string }>) ?? []
  
  // Filter categories by selected transaction type (or 'both')
  const filteredCategories = categories.filter(c => c.type === type || c.type === 'both')

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setType(transaction.type)
        setAmount(transaction.amount.toString())
        setDate(new Date(transaction.date).toISOString().split('T')[0])
        setCategoryId(typeof transaction.category === 'object' ? transaction.category._id : transaction.category)
        setNote(transaction.note ?? '')
      } else {
        setType('expense')
        setAmount('')
        setDate(new Date().toISOString().split('T')[0])
        setCategoryId('')
        setNote('')
      }
    }
  }, [isOpen, transaction])

  // Auto-select first category if none selected or if selected is not in the filtered list
  useEffect(() => {
    if (filteredCategories.length > 0) {
      if (!categoryId || !filteredCategories.find(c => c._id === categoryId)) {
        setCategoryId(filteredCategories[0]._id)
      }
    } else {
      setCategoryId('')
    }
  }, [type, filteredCategories, categoryId])

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (transaction) {
        return transactionsApi.update(transaction._id, data)
      }
      return transactionsApi.create(data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['transactions'] })
      void queryClient.invalidateQueries({ queryKey: ['summary'] })
      onClose()
    }
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !categoryId || !date) return
    
    mutation.mutate({
      type,
      amount: parseFloat(amount),
      date,
      category: categoryId,
      note: note.trim() || undefined
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{transaction ? 'Edit Transaction' : 'New Transaction'}</h2>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <div className="form-field" style={{ flexDirection: 'row', gap: '1rem', background: 'var(--color-surface-2)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
              <button
                type="button"
                className={`btn ${type === 'expense' ? 'btn-danger' : 'btn-ghost'}`}
                style={{ flex: 1 }}
                onClick={() => setType('expense')}
              >
                Expense
              </button>
              <button
                type="button"
                className={`btn ${type === 'income' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ flex: 1 }}
                onClick={() => setType('income')}
              >
                Income
              </button>
            </div>

            <div className="form-field">
              <label htmlFor="tx-amount" className="label">Amount</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>$</span>
                <input
                  id="tx-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="input"
                  style={{ paddingLeft: '1.75rem' }}
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="tx-date" className="label">Date</label>
              <input
                id="tx-date"
                type="date"
                className="input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="tx-category" className="label">Category</label>
              <select
                id="tx-category"
                className="input"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                {filteredCategories.length === 0 ? (
                  <option value="" disabled>No categories available</option>
                ) : (
                  filteredCategories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))
                )}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="tx-note" className="label">Note (Optional)</label>
              <input
                id="tx-note"
                type="text"
                className="input"
                placeholder="What was this for?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending || !categoryId}>
              {mutation.isPending ? 'Saving…' : 'Save Transaction'}
            </button>
          </div>
          {mutation.isError && (
            <p style={{ color: 'var(--color-expense)', fontSize: '0.8125rem', marginTop: '1rem', textAlign: 'center' }}>
              Failed to save transaction. Please try again.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
