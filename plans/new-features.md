1. Advanced Portfolio & Investment Features
  Since we just refined how investments track "Units" and "Invested Value", we can expand on this:
   * Multi-Currency Support: If users hold international assets (e.g., US stocks), allow tracking them in
     their native currency with real-time conversion to the profile's base currency.
   * Dividend & Yield Tracking: Add a specific transaction type or field to track dividends received from
     stocks or mutual funds, separating capital gains from cash flow.
   * Asset Allocation Charting: A visual breakdown of investments by class (Equity, Debt, Gold, Real
     Estate) or risk profile.

  2. Automation & Data Entry
   * CSV Import/Export: Allow users to import their monthly bank or credit card statements (CSV) and
     automatically categorize them, saving them from manual entry.
   * Recurring Transactions & Subscriptions: A dedicated view for monthly bills (Netflix, rent, gym). The
     app could automatically log these on a specific date or alert the user of upcoming due dates.

  3. Expanding the AI Capabilities
  According to your ai-insights-strategy.md, we have groundwork laid out for AI. We could build out Phase
  2 and 3:
   * Cash Flow Forecasting: Predict the end-of-month balance based on current spending velocity and
     upcoming recurring bills.
   * Financial Chatbot ("Ledgr AI"): A chat interface where users can ask natural language questions like
     "How much did I spend on dining out this month?" or "Can I afford a $500 purchase right now?"

  4. Debt & Liability Tracking
   * Loan & Credit Card Management: Currently, the app focuses heavily on assets and expenses. We could
     add a dedicated "Liabilities" section to track mortgages, car loans, or credit card debt, including
     interest rates and projected payoff dates.

  5. Enhanced Budgeting & Goals
   * Rollover Budgets (Envelope Budgeting): Allow unspent budget amounts from one month to roll over into
     the next month's budget for that specific category.
   * Shared/Family Accounts: Allow multiple users (e.g., spouses) to link their profiles to a shared
     ledger or specific shared budget categories.

  6. User Experience (UX) Enhancements
   * Progressive Web App (PWA): Configure the Next.js app to be installable on mobile devices with offline
     caching for faster load times.
   * Dark Mode / Theming: Ensure the Tailwind configuration supports a seamless toggle between light and
     dark modes, or even custom accent colors.
