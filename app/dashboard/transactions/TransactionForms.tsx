"use client";

import { ChangeEvent, useState } from "react";
import { addTransaction, addCategory, updateTransaction, deleteTransaction, updateCategory, deleteCategory } from "./actions";
import { Category, EmergencyFund, Investment, Account } from "@/types/database";

import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  ChevronDownIcon,
  SwatchIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

export function AddTransactionForm({ 
  categories, 
  emergencyFunds = [],
  investments = [],
  accounts = []
}: { 
  categories: Category[], 
  emergencyFunds?: EmergencyFund[],
  investments?: Investment[],
  accounts?: Account[]
}) {
  const [type, setType] = useState<"income" | "expense" | "transfer">("expense");

  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value as "income" | "expense" | "transfer");
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm mb-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Transaction</h3>
      <form action={addTransaction} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <option value="transfer">Self-Transfer</option>
          </select>
        </div>

        {type !== 'transfer' ? (
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
        ) : (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To Account (Destination)</label>
            <select
              name="to_account_id"
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
              required
            >
              <option value="">Select destination</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {type === 'transfer' ? 'From Account (Source)' : 'Account'}
          </label>
          <select
            name="account_id"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
          >
            <option value="">Select account</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
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
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Link to Investment</label>
          <select
            name="investment_id"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
          >
            <option value="">Not for investment</option>
            {investments.map((i) => (
              <option key={i.id} value={i.id}>
                {i.asset_name} {i.symbol ? `(${i.symbol})` : ""}
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

export function EditTransactionModal({ 
  transaction, 
  onClose,
  categories,
  emergencyFunds,
  investments,
  accounts
}: { 
  transaction: any, 
  onClose: () => void,
  categories: Category[],
  emergencyFunds: EmergencyFund[],
  investments: Investment[],
  accounts: Account[]
}) {
  const [type, setType] = useState<"income" | "expense" | "transfer">(transaction.type);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-2xl w-full">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Edit Transaction</h3>
        <form action={async (formData) => {
          await updateTransaction(transaction.id, formData);
          onClose();
        }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
            <input
              type="number"
              step="0.01"
              name="amount"
              defaultValue={transaction.amount}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
            <select
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="transfer">Self-Transfer</option>
            </select>
          </div>

          {type !== 'transfer' ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <select
                name="category_id"
                defaultValue={transaction.category_id || ""}
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
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To Account</label>
              <select
                name="to_account_id"
                defaultValue={transaction.to_account_id || ""}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                required
              >
                <option value="">Select destination</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account</label>
            <select
              name="account_id"
              defaultValue={transaction.account_id || ""}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Link to Emergency Fund</label>
            <select
              name="emergency_fund_id"
              defaultValue={transaction.emergency_fund_id || ""}
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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Link to Investment</label>
            <select
              name="investment_id"
              defaultValue={transaction.investment_id || ""}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
            >
              <option value="">Not for investment</option>
              {investments.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.asset_name} {i.symbol ? `(${i.symbol})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
            <input
              type="date"
              name="date"
              defaultValue={transaction.date}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
            <input
              type="text"
              name="notes"
              defaultValue={transaction.notes || ""}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddCategoryForm({ categories }: { categories: Category[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  if (!showForm) {
    return (
      <div className="flex flex-col mb-8">
        <button
          onClick={() => setShowForm(true)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium self-start mb-4"
        >
          + Manage Categories
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-md font-semibold text-gray-900 dark:text-white">Categories</h3>
        <button onClick={() => setShowForm(false)} className="text-xs text-gray-500 hover:text-gray-700 font-medium">Close</button>
      </div>

      <form action={async (formData) => {
          await addCategory(formData);
      }} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">New Name</label>
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
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Color</label>
          <input
            type="color"
            name="color"
            defaultValue="#2563eb"
            className="h-9 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none p-1"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            Add
          </button>
        </div>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {categories.map((category) => (
          <div 
            key={category.id} 
            className="flex flex-col items-center p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm"
          >
            <div 
              className="w-3 h-3 rounded-full mb-2" 
              style={{ backgroundColor: category.color || '#ccc' }} 
            />
            <span className="text-xs font-bold text-gray-900 dark:text-white truncate w-full text-center">
              {category.name}
            </span>
            <span className="text-[10px] text-gray-500 uppercase font-medium mt-0.5">
              {category.type}
            </span>

            <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 w-full">
              <button 
                onClick={() => setEditingCategory(category)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Edit Category"
              >
                <PencilSquareIcon className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={async () => {
                  if (confirm(`Delete ${category.name}?`)) {
                    await deleteCategory(category.id);
                  }
                }}
                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                title="Delete Category"
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingCategory && (
        <EditCategoryModal 
          category={editingCategory} 
          onClose={() => setEditingCategory(null)} 
        />
      )}
    </div>
  );
}

export function EditCategoryModal({ category, onClose }: { category: Category, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-lg w-full">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Edit Category</h3>
        <form action={async (formData) => {
          await updateCategory(category.id, formData);
          onClose();
        }} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              type="text"
              name="name"
              defaultValue={category.name}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
            <select
              name="type"
              defaultValue={category.type}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
              required
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
            <input
              type="color"
              name="color"
              defaultValue={category.color || "#2563eb"}
              className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none p-1"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
