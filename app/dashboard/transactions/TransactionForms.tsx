"use client";

import { ChangeEvent, useState } from "react";
import { addTransaction, addCategory } from "./actions";
import { Category, EmergencyFund } from "@/types/database";

export function AddTransactionForm({ 
  categories, 
  emergencyFunds = [] 
}: { 
  categories: Category[], 
  emergencyFunds?: EmergencyFund[] 
}) {
  const [type, setType] = useState<"income" | "expense">("expense");

  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value as "income" | "expense");
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm mb-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Transaction</h3>
      <form action={addTransaction} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* ... (amount, type fields) ... */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
          <input
            type="number"
            step="0.01"
            name="amount"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
            placeholder="0.00"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
          <select
            name="type"
            value={type}
            onChange={handleTypeChange}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
          <select
            name="category_id"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
          >
            <option value="">No category</option>
            {categories
              .filter((c) => c.type === type)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Link to Emergency Fund</label>
          <select
            name="emergency_fund_id"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
          >
            <option value="">Not for emergency fund</option>
            {emergencyFunds.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.instrument_type})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
          <input
            type="date"
            name="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5 lg:col-span-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
          <input
            type="text"
            name="notes"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
            placeholder="Lunch, Salary, Rent..."
          />
        </div>

        <div className="lg:col-span-3 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            Add Transaction
          </button>
        </div>
      </form>
    </div>
  );
}

export function AddCategoryForm() {
  const [showForm, setShowForm] = useState(false);

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-4"
      >
        + Add New Category
      </button>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 mb-8">
      <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">New Category</h3>
      <form action={async (formData) => {
          await addCategory(formData);
          setShowForm(false);
      }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</label>
          <input
            type="text"
            name="name"
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
            placeholder="Groceries..."
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</label>
          <select
            name="type"
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Color (Hex)</label>
          <input
            type="color"
            name="color"
            defaultValue="#2563eb"
            className="h-9 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none p-1"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
