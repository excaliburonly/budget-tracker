"use client";

import { useState } from "react";
import { createEmergencyFund } from "./actions";

export default function EmergencyFundForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await createEmergencyFund(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        (document.getElementById("fund-form") as HTMLFormElement).reset();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">New Emergency Fund Goal</h3>
      <form id="fund-form" action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fund Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            placeholder="e.g. 6-Month Rainy Day Fund"
            className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="instrument_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Instrument Type
          </label>
          <select
            name="instrument_type"
            id="instrument_type"
            required
            className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Savings Account">Savings Account</option>
            <option value="Fixed Deposit (FD)">Fixed Deposit (FD)</option>
            <option value="Recurring Deposit (RD)">Recurring Deposit (RD)</option>
            <option value="Liquid Mutual Fund">Liquid Mutual Fund</option>
            <option value="Cash">Cash</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="institution_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Institution Name
          </label>
          <input
            type="text"
            name="institution_name"
            id="institution_name"
            placeholder="e.g. HDFC Bank, Zerodha"
            className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="target_amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Target Goal (₹)
          </label>
          <input
            type="number"
            name="target_amount"
            id="target_amount"
            required
            placeholder="0.00"
            className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Creating..." : "Set Fund Goal"}
        </button>
      </form>
    </div>
  );
}
