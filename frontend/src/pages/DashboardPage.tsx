import { useQuery } from '@tanstack/react-query'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
} from 'lucide-react'
import { transactionsApi } from '../api/axios'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

interface SummaryData {
  balance: number
  totalIncome: number
  totalExpenses: number
  monthly: {
    income: number
    expenses: number
    balance: number
    transactionCount: number
  }
  chartData: Array<{
    month: string
    income: number
    expenses: number
  }>
  categoryBreakdown: Array<{
    categoryId: string
    categoryName: string
    categoryColor: string
    total: number
    percentage: number
  }>
}

export function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['summary'],
    queryFn: async () => {
      const res = await transactionsApi.getSummary()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return res.data.data as SummaryData
    },
  })

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
        <LoadingSpinner size="lg" label="Loading dashboard data…" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="alert alert-error">
        <AlertCircle size={16} style={{ marginTop: '2px' }} />
        <div>
          <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Failed to load dashboard</p>
          <p>{error instanceof Error ? error.message : 'An unknown error occurred.'}</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="label">Total Balance</p>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0 0' }}>
                {formatCurrency(data.balance)}
              </h2>
            </div>
            <div style={{ padding: '0.625rem', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: 'var(--radius-md)' }}>
              <Wallet size={20} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="label">Monthly Income</p>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0 0' }}>
                {formatCurrency(data.monthly.income)}
              </h2>
            </div>
            <div style={{ padding: '0.625rem', background: 'var(--color-income-bg)', color: 'var(--color-income)', borderRadius: 'var(--radius-md)' }}>
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="label">Monthly Expenses</p>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0 0' }}>
                {formatCurrency(data.monthly.expenses)}
              </h2>
            </div>
            <div style={{ padding: '0.625rem', background: 'var(--color-expense-bg)', color: 'var(--color-expense)', borderRadius: 'var(--radius-md)' }}>
              <TrendingDown size={20} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="label">Transactions (This Month)</p>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0 0' }}>
                {data.monthly.transactionCount}
              </h2>
            </div>
            <div style={{ padding: '0.625rem', background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-md)' }}>
              <Activity size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts Section ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Cash Flow Chart */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '1.5rem' }}>Cash Flow (6 Months)</h3>
          {data.chartData.length > 0 ? (
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} tickFormatter={(val) => `$${val}`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}
                    formatter={(val: any) => [formatCurrency(val as number), undefined]}
                  />
                  <Line type="monotone" dataKey="income" name="Income" stroke="var(--color-income)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="expenses" name="Expenses" stroke="var(--color-expense)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem 1rem', height: '100%', flex: 1 }}>
              <p>No data for the last 6 months.</p>
            </div>
          )}
        </div>

        {/* Top Expenses */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '1.5rem' }}>Top Expenses (This Month)</h3>
          {data.categoryBreakdown.length > 0 ? (
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categoryBreakdown} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--color-border)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="categoryName" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} width={100} />
                  <Tooltip
                    cursor={{ fill: 'var(--color-surface-2)' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}
                    formatter={(val: any, _name: any, props: any) => [
                      `${formatCurrency(val as number)} (${props.payload.percentage}%)`,
                      'Total'
                    ]}
                  />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={24}>
                    {data.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.categoryColor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem 1rem', height: '100%', flex: 1 }}>
              <p>No expenses this month yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
