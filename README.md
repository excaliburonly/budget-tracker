# 📒 Ledgr — Modern Monthly Finance Tracker

**Ledgr** is a visually appealing, fully functional monthly finance tracker designed to help you stay on top of your earnings, expenses, budgets, investments, and emergency funds. Built with the latest cutting-edge web technologies, it provides a seamless and secure experience for personal finance management.

## ✨ Features

- **🔐 Secure Authentication**: Robust sign-up and login flow powered by Supabase Auth with Row Level Security (RLS) for complete data privacy.
- **📊 Comprehensive Dashboard**: A central hub providing an overview of your total earnings, expenses, and net balance.
- **💸 Transaction Ledger**: Log daily income and expenses with ease, including category tagging and optional linking to emergency funds.
- **🎯 Budget Management**: Set monthly spending limits per category and track your progress with intuitive visualizations.
- **📈 Investment Portfolio**: Monitor your assets, symbols, quantities, and current values in a dedicated investment view.
- **🛡️ Emergency Funds**: Track progress towards savings goals across various instruments (FDs, RDs, Mutual Funds, etc.) with automatic balance syncing.
- **🎨 Modern Visual Language**: A professional, high-contrast UI built using Tailwind CSS 4, featuring responsive layouts and smooth transitions.
- **🌓 Dark/Light Mode**: Full support for system-based or user-selected themes.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Frontend Library**: [React 19](https://react.dev/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [@heroicons/react](https://heroicons.com/)
- **Runtime**: [Bun](https://bun.sh/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🏗️ Project Structure

- `actions/`: Next.js Server Actions for database operations and business logic.
- `app/`: Next.js App Router pages and layouts.
- `components/`: Feature-specific UI components (auth, dashboard, forms, brand, theme).
- `providers/`: Context providers for global state management (theme, dashboard).
- `types/`: TypeScript definitions for database schemas and application models.
- `utils/`: Utility functions and Supabase client/server configurations.
- `public/`: Static assets such as logos and icons.

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have [Bun](https://bun.sh/) installed on your machine.

### 2. Clone the Repository
```bash
git clone <your-repo-url>
cd budget-tracker
```

### 3. Install Dependencies
```bash
bun install
```

### 4. Environment Setup
Create a `.env.local` file in the root directory and add your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-supabase-anon-key
```

### 5. Run the Development Server
```bash
bun dev
```
Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🗺️ Roadmap

- **Phase 1: Database & Security** (Completed) - Schema design, RLS policies, and automated triggers.
- **Phase 2: Authentication** (Completed) - Full auth flow and middleware protection.
- **Phase 3: Core Ledger** (In Progress) - Transaction management and category UI.
- **Phase 4: Budgets & Dashboards** - Monthly limit setting and progress visualizations.
- **Phase 5: Investments** - Asset tracking and portfolio value monitoring.
- **Phase 6: Emergency Funds** - Goal tracking across various financial instruments.

## 📄 License
This project is private and for personal use.
