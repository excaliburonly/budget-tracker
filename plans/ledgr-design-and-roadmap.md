# 📒 Ledgr - System Design & Roadmap

**Goal:** Autonomously build a visually appealing, fully functional monthly finance tracker that helps users monitor earnings, expenses, budgets, and investments.

## 1. Architecture & Tech Stack
- **Framework:** Next.js (App Router) with TypeScript.
- **Styling:** Vanilla CSS (using CSS Modules for scoping and CSS Variables for a robust theming system).
- **Backend & Database:** Supabase (PostgreSQL for data, GoTrue for Authentication, Row Level Security (RLS) for privacy).
- **Icons/Visuals:** Inline SVGs and procedural CSS patterns.

## 2. Data Model (Supabase)
Core tables in the `public` schema with Row Level Security (RLS) enabled:

- **`profiles`**: Tied to Supabase `auth.users`. Stores basic user info (name, preferred currency).
- **`categories`**: User-defined transaction categories (e.g., "Groceries", "Salary", "Rent").
    - Columns: `id`, `user_id`, `name`, `type` (income/expense), `icon`, `color`.
- **`transactions`**: The core ledger entries.
    - Columns: `id`, `user_id`, `amount`, `date`, `category_id`, `notes`, `type`.
- **`budgets`**: Monthly spending limits.
    - Columns: `id`, `user_id`, `category_id`, `amount`, `month` (e.g., "2026-04").
- **`investments`**: Tracks portfolio assets over time.
    - Columns: `id`, `user_id`, `asset_name`, `symbol`, `quantity`, `average_buy_price`, `current_value`.

## 3. Visual Language
- **Theme:** "Modern Finance" — high-contrast, professional, token-based CSS system in `globals.css`.
- **Layout:** Persistent sidebar navigation, card-based dashboards.
- **Feedback:** Smooth hover states, subtle transitions, clear loading/error states.

## 4. Step-by-Step Roadmap

### Phase 1: Database & Security
- Write and execute SQL migrations to create tables.
- Establish robust RLS policies for data isolation.
- Create a trigger for automatic `profile` generation on user signup.

### Phase 2: Authentication Setup
- Build out Auth flow (Sign Up, Sign In, Sign Out).
- Secure Next.js App Router using Supabase middleware.

### Phase 3: The Core Ledger (Transactions)
- Build global layout (Sidebar/Navbar).
- Create "Add Transaction" UI and logic.
- Display clean, paginated list of recent transactions.
- Implement basic category management.

### Phase 4: Budgets & Dashboards
- Create monthly dashboard overview (Total Earnings, Total Expenses, Net Balance).
- Build UI to set monthly limits per category and visualize progress.

### Phase 5: Investments
- Add dedicated Investments view to log assets and track portfolio value.
