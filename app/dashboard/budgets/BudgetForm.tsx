"use client";

import { useState } from "react";
import { createBudget } from "./actions";
import { Category } from "@/types/database";

interface BudgetFormProps {
  categories: Category[];
}

export default function BudgetForm({ categories }: BudgetFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await createBudget(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        // Reset form or close modal if needed
        (document.getElementById("budget-form") as HTMLFormElement).reset();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Budget Limit</h3>
      <form id="budget-form" action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            name="category_id"
            id="category_id"
            required
            className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a category</option>
            {categories
              .filter((c) => c.type === "expense")
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Monthly Limit
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
            <input
              type="number"
              step="0.01"
              name="amount"
              id="amount"
              required
              placeholder="0.00"
              className="w-full pl-8 rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Month
          </label>
          <input
            type="month"
            name="month"
            id="month"
            defaultValue={new Date().toISOString().slice(0, 7)}
            required
            className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Adding..." : "Set Budget"}
        </button>
      </form>
    </div>
  );
}
