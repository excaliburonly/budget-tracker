# AI "What-If" Simulator Strategy

## Overview
The "What-If" Simulator allows users to run hypothetical financial scenarios. It uses current financial data (balances, income, expenses, and the newly separated investments) to project future outcomes based on user-defined changes.

## Feature Access
- **Free Tier:** Can view the "What-If" UI but cannot run simulations. Sees a "Upgrade to Premium" CTA.
- **Premium Tier:** Full access to run unlimited AI-driven simulations.

## Technical Components

### 1. Data Aggregation
The simulator needs:
- Current net worth (Liquid cash + Investments).
- Monthly average income.
- Monthly average expenses (excluding investments).
- Current monthly investment velocity.
- Active savings goals and their targets.

### 2. Simulation Types
- **Goal Projection:** "When will I reach X goal if I save Y more?"
- **Budget Optimization:** "What if I reduce category X by 10% and invest the difference?"
- **Compounding Impact:** "What is the 10-year difference if I invest an extra 1,000/month vs spending it?"

### 3. AI Integration (Gemini)
- **Input:** Current financial snapshot + "What-If" parameters.
- **Processing:** AI calculates compounding interest (using conservative estimates for stocks/mutual funds) and timeline adjustments.
- **Output:** Structured JSON containing the projected timeline, total wealth at intervals, and "Advice" commentary.

## UI/UX
- **Interactive Form:** Sliders or inputs for the "What-If" variables.
- **Comparison View:** Split view showing "Current Path" vs. "What-If Path".
- **Visuals:** Simple projection line chart (using Recharts).
