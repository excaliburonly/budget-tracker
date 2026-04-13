# Plan: Automatic Tracking of NAV for Mutual Fund Investments

## Objective
Implement a feature to automatically fetch and update the Net Asset Value (NAV) for mutual fund investments, ensuring the user's portfolio always reflects the latest market values.

## Current State Analysis
- The `investments` table currently stores `symbol`, `quantity`, `average_buy_price`, and `current_value`.
- The schema currently lacks an `updated_at` or `last_synced_at` field specifically for investments to track when the NAV was last updated.
- Investments have an `investment_type` field which can be used to distinguish Mutual Funds (e.g., `'mutual_fund'`) from other asset classes.

## Proposed Solution

### 1. Database Schema Updates
Add a `last_synced_at` timestamp to the `investments` table to avoid spamming the NAV API and to let the user know when the data was last updated.
- **Migration:** Run a SQL migration via Supabase to add `last_synced_at TIMESTAMP WITH TIME ZONE` to the `investments` table.
- **TypeScript Types:** Update the `Investment` interface in `types/database.ts` to include `last_synced_at?: string`.

### 2. External API Integration
Integrate with a public NAV API to fetch the latest values. 
- For Indian Mutual Funds, [mfapi.in](https://www.mfapi.in/) is a free and reliable public API that accepts a Scheme Code (which we can store in the `symbol` field).
- For Global Mutual Funds/Stocks, Yahoo Finance API (e.g., via `yahoo-finance2` npm package) can be used. 
*Note: The plan assumes integration with a free, public API. We can use a configurable provider or standard Yahoo Finance.*

### 3. Server Action for Syncing NAV
Create a new Server Action in `actions/investments.ts`: `syncMutualFundNAVs()`.
- **Logic:**
  1. Fetch all investments where `investment_type === 'mutual_fund'` and `symbol` is not null.
  2. Filter out investments synced within the last 12-24 hours to rate-limit API calls.
  3. Iterate (or batch if the API supports it) through the funds, calling the NAV API with the `symbol`.
  4. Calculate the new `current_value` = `quantity * latest_NAV`.
  5. Update the `investments` records in Supabase with the new `current_value` and `last_synced_at = NOW()`.
  6. Call `revalidatePath('/dashboard/investments')` to refresh the UI.

### 4. UI/UX Enhancements
Update the Investments Dashboard (`components/dashboard/InvestmentCard.tsx` and `app/dashboard/investments/page.tsx`):
- **Sync Button:** Add a "Sync NAVs" button on the Investments page that triggers the `syncMutualFundNAVs` server action, showing a loading state (spinner) while syncing.
- **Last Synced Indicator:** Display a small text indicator (e.g., "Last updated: 2 hours ago") on Mutual Fund investment cards.
- **Form Update:** Ensure the Add/Edit Investment form clearly indicates that the `symbol` field should contain the Mutual Fund Scheme Code/Ticker for automatic tracking.

### 5. (Optional) Automated Cron Job
To make the tracking fully "automatic" without user interaction:
- Create a Next.js Route Handler (e.g., `app/api/cron/sync-nav/route.ts`).
- Secure the route using a secret token (e.g., `CRON_SECRET`).
- Configure a Vercel Cron Job in `vercel.json` to hit this endpoint daily.
- Alternatively, utilize Supabase `pg_cron` to make an HTTP request to the API, or directly update it via Edge Functions.

## Implementation Steps
1. **Schema & Types:** Update `types/database.ts` and apply the Supabase migration for `last_synced_at`.
2. **API Utility:** Create a utility function in `utils/nav-api.ts` to abstract the API call (e.g., fetching from mfapi.in or Yahoo Finance).
3. **Server Action:** Implement `syncMutualFundNAVs()` in `actions/investments.ts`.
4. **UI Integration:** Add the "Sync NAV" button and update the Investment Cards.
5. **Testing:** Test with valid and invalid symbols to ensure errors are handled gracefully without breaking the dashboard.
6. **Final Review:** Ensure adherence to React 19 / Next.js 15 conventions (e.g., properly handling Server Actions and client transitions).
