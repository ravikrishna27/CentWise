# CentWise

CentWise is a modern, full-stack personal finance and expense tracking application built to help you manage your money with clarity and wisdom. 

## ✨ Features
- **Insightful Dashboard:** View a 6-month cash flow chart and your top expenses broken down beautifully using Recharts.
- **Transaction Ledger:** Full CRUD capabilities for logging income and expenses seamlessly with dynamic filtering.
- **Category Management:** Comes pre-seeded with 12 default categories, plus the ability to create custom color-coded categories.
- **Secure Authentication:** JSON Web Token (JWT) based login/registration with rigorous route guards protecting your financial data.
- **Dark Mode:** A stunning, premium OLED-style dark mode that dynamically swaps colors and syncs to your local storage.

## 🛠️ Tech Stack
- **Frontend:** React 19, TypeScript, Vite, React Query, Recharts, Lucide Icons
- **Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose ORM)
- **Styling:** Custom Vanilla CSS utilizing powerful CSS Variables for a lightweight, dependency-free UI.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or via MongoDB Atlas)

### 1. Setup the Backend
Navigate to the `backend` folder and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory based on the following template:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/centwise
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

Start the backend development server:
```bash
npm run dev
```

### 2. Setup the Frontend
In a new terminal window, navigate to the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application!

## 📄 License
This project is open-source and available under the MIT License.
