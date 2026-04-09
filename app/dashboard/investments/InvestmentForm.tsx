"use client";

import { useState } from "react";
import { addInvestment } from "./actions";

export default function InvestmentForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await addInvestment(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        (document.getElementById("investment-form") as HTMLFormElement).reset();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Investment</h3>
      <form id="investment-form" action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="asset_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Asset Name
            </label>
            <input
              type="text"
              name="asset_name"
              id="asset_name"
              required
              placeholder="e.g. Nifty 50 Index Fund"
              className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Symbol / Ticker
            </label>
            <input
              type="text"
              name="symbol"
              id="symbol"
              placeholder="e.g. NIFTYBEES"
              className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 uppercase"
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantity
            </label>
            <input
              type="number"
              step="0.0001"
              name="quantity"
              id="quantity"
              required
              placeholder="0.00"
              className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="average_buy_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Avg. Buy Price (₹)
            </label>
            <input
              type="number"
              step="0.01"
              name="average_buy_price"
              id="average_buy_price"
              required
              placeholder="0.00"
              className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="current_value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Market Value (₹)
            </label>
            <input
              type="number"
              step="0.01"
              name="current_value"
              id="current_value"
              required
              placeholder="0.00"
              className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : "Add Investment"}
        </button>
      </form>
    </div>
  );
}
