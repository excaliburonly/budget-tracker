# 📒 Ledgr - System Design & Roadmap

**Goal:** Autonomously build a visually appealing, fully functional monthly finance tracker that helps users monitor earnings, expenses, budgets, investments, and emergency funds.

## 1. Architecture & Tech Stack
- **Framework:** Next.js (App Router) with TypeScript.
- **Styling:** Tailwind CSS (for rapid, utility-first UI development and consistent design tokens).
- **Backend & Database:** Supabase (PostgreSQL for data, GoTrue for Authentication, Row Level Security (RLS) for privacy).
- **Icons/Visuals:** Lucide React / Heroicons (Tailwind-friendly SVG icons).

## 2. Data Model (Supabase)
Core tables in the `public` schema with Row Level Security (RLS) enabled:

- **`profiles`**: Tied to Supabase `auth.users`. Stores basic user info (name, preferred currency).
- **`categories`**: User-defined transaction categories (e.g., "Groceries", "Salary", "Rent").
    - Columns: `id`, `user_id`, `name`, `type` (income/expense), `icon`, `color`.
- **`transactions`**: The core ledger entries.
    - Columns: `id`, `user_id`, `amount`, `date`, `category_id`, `notes`, `type`, `emergency_fund_id` (nullable).
- **`budgets`**: Monthly spending limits.
    - Columns: `id`, `user_id`, `category_id`, `amount`, `month` (e.g., "2026-04").
- **`investments`**: Tracks portfolio assets over time.
    - Columns: `id`, `user_id`, `asset_name`, `symbol`, `quantity`, `average_buy_price`, `current_value`.
- **`emergency_funds`**: Tracks savings goals parked in various financial instruments.
    - Columns: `id`, `user_id`, `name`, `instrument_type` (e.g., FD, RD, Mutual Fund), `institution_name`, `target_amount`, `current_amount` (auto-synced), `created_at`, `updated_at`.

## 3. Visual Language
- **Theme:** "Modern Finance" — high-contrast, professional, utilizing Tailwind's color palette and spacing system.
- **Layout:** Responsive sidebar navigation, card-based dashboards, and interactive data tables.
- **Feedback:** Tailwind transitions/animations for smooth hover states and state changes.

## 4. Step-by-Step Roadmap

### Phase 1: Database & Security
- Write and execute SQL migrations to create tables.
- Establish robust RLS policies for data isolation.
- Create a trigger for automatic `profile` generation on user signup.
- **New:** Implement `sync_emergency_fund_balance` trigger for automated tracking.

### Phase 2: Authentication Setup
- Build out Auth flow (Sign Up, Sign In, Sign Out) using Supabase Auth.
- Secure Next.js App Router using Supabase middleware.

### Phase 3: The Core Ledger (Transactions)
- Build global layout (Sidebar/Navbar) with Tailwind CSS.
- Create "Add Transaction" UI with fund-linking capability.
- Display clean, paginated list of recent transactions.
- Implement basic category management.

### Phase 4: Budgets & Dashboards
- Create monthly dashboard overview (Total Earnings, Total Expenses, Net Balance).
- Build UI to set monthly limits per category and visualize progress.

### Phase 5: Investments
- Add dedicated Investments view to log assets and track portfolio value.

### Phase 6: Emergency Funds
- Build UI to manage emergency fund goals and their associated instruments (FDs, RDs, etc.).
- Visualize goal progress with progress bars and instrument breakdown.
- Ensure transactions tagged with a fund ID automatically update the fund balance.
