import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db'
import authRoutes from './routes/auth.routes'
import transactionRoutes from './routes/transaction.routes'
import categoryRoutes from './routes/category.routes'
import { errorHandler, notFound } from './middleware/errorHandler'

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express()
const PORT = process.env.PORT ?? 5000

// ─── Global Middleware ────────────────────────────────────────────────────────

// CORS — allow requests from the Vite dev server in development
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.CLIENT_ORIGIN ?? '*'
        : 'http://localhost:5173',
    credentials: true,
  })
)

// Parse JSON bodies (limit prevents large payloads / DoS)
app.use(express.json({ limit: '10kb' }))

// Parse URL-encoded bodies (HTML form submissions)
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'FinTrack API is running 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/categories', categoryRoutes)

// ─── Error Handling ───────────────────────────────────────────────────────────
// Must be registered AFTER all routes
app.use(notFound)
app.use(errorHandler)

// ─── Bootstrap ────────────────────────────────────────────────────────────────
// Connect to DB first; only start listening if connection succeeds
const start = async (): Promise<void> => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
    console.log(`   Health check: http://localhost:${PORT}/api/health\n`)
  })
}

start()

export default app
