# CentWise

CentWise is a modern, full-stack personal finance and expense tracking application built to help you manage your money with clarity and wisdom.

![CentWise Dashboard](https://img.shields.io/badge/Stack-MERN-6366f1?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6?style=flat-square) ![License](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)

## ✨ Features

- **Insightful Dashboard** — View a 6-month cash flow chart and top expense breakdowns rendered with Recharts.
- **Transaction Ledger** — Full CRUD for logging income and expenses with type filtering, pagination, and dynamic category assignment.
- **Category Management** — 12 pre-seeded default categories plus the ability to create custom color-coded categories.
- **Secure Authentication** — JWT + bcrypt login/registration with protected REST APIs and frontend route guards.
- **Dark Mode** — OLED-style dark theme with persistent preference via `localStorage`.
- **Collapsible Sidebar** — Toggle-able sidebar on both mobile (slide-over) and desktop.
- **Accessible UI** — WCAG 2.1 AA compliant: focus trapping in modals, `role="dialog"`, `aria-live` regions, keyboard navigation, visible focus rings, and screen-reader-friendly labels throughout.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite |
| **State / Data** | TanStack Query (React Query) |
| **Charts** | Recharts |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | MongoDB + Mongoose ORM |
| **Auth** | JSON Web Tokens (JWT) + bcrypt |
| **Styling** | Vanilla CSS with CSS Custom Properties |
| **Icons** | Lucide React |

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (running locally or via [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone the repository

```bash
git clone https://github.com/ravikrishna27/CentWise.git
cd CentWise
```

### 2. Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/centwise
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

> **Note:** Use `127.0.0.1` instead of `localhost` to avoid IPv6 resolution issues on Windows.

Start the backend dev server:

```bash
npm run dev
```

### 3. Setup the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

<<<<<<< HEAD
## 📁 Project Structure

```
CentWise/
├── backend/
│   └── src/
│       ├── config/         # Database connection
│       ├── controllers/    # Route handlers (auth, transactions, categories)
│       ├── middleware/     # JWT auth guard, error handler
│       ├── models/         # Mongoose schemas (User, Transaction, Category)
│       └── routes/         # Express routers
└── frontend/
    └── src/
        ├── api/            # Axios instance + typed API helpers
        ├── components/
        │   ├── categories/ # CategoryModal
        │   ├── layout/     # Layout, Sidebar, Topbar
        │   ├── transactions/ # TransactionModal
        │   └── ui/         # LoadingSpinner, Logo, focus utilities
        ├── contexts/       # AuthContext (JWT state)
        ├── hooks/          # useAuth, useFocusTrap
        ├── pages/          # Dashboard, Transactions, Categories, Login, Register
        └── routes/         # ProtectedRoute, PublicRoute guards
```

## ♿ Accessibility

CentWise includes a comprehensive accessibility pass:

- **Focus trapping** — Custom `useFocusTrap` hook keeps keyboard focus inside modals; restores focus on close.
- **ARIA** — All dialogs use `role="dialog"`, `aria-modal`, `aria-labelledby`. Error messages use `role="alert"` for live announcements.
- **Keyboard navigation** — Full Tab/Shift+Tab, Enter, Space, and Escape support across the entire app.
- **Screen reader** — All interactive icons have `aria-hidden="true"`, all controls have descriptive labels, table headers use `scope="col"`.
- **Focus rings** — Visible `:focus-visible` outlines on all buttons and inputs for keyboard users.

=======
>>>>>>> 8d88eb9bcc2159496bd38c83180e24e9886e92f4
## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
