"use client";

import { createBudget, updateBudget } from "@/actions/budgets";
import { Budget } from "@/types/database";
import { useDashboard } from "@/providers/dashboard-provider";

interface BudgetFormProps {
  onBudgetAddedAction?: () => void;
}

export function AddBudgetForm({ onBudgetAddedAction }: BudgetFormProps) {
  const { categories, refreshBudgets, setIsSaving } = useDashboard();

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    try {
      const res = await createBudget(formData);
      if (res?.error) {
        alert(res.error);
      } else {
        const form = document.getElementById("budget-form") as HTMLFormElement;
        form?.reset();
        await refreshBudgets();
        if (onBudgetAddedAction) onBudgetAddedAction();
      }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "An unknown error occurred");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4">Add Budget Limit</h3>
      <form id="budget-form" action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-foreground/80 mb-1">
            Category
          </label>
          <select
            name="category_id"
            id="category_id"
            required
            className="w-full rounded-lg border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
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
          <label htmlFor="amount" className="block text-sm font-medium text-foreground/80 mb-1">
            Monthly Limit
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">₹</span>
            <input
              type="number"
              step="0.01"
              name="amount"
              id="amount"
              required
              placeholder="0.00"
              className="w-full pl-8 rounded-lg border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="month" className="block text-sm font-medium text-foreground/80 mb-1">
            Month
          </label>
          <input
            type="month"
            name="month"
            id="month"
            defaultValue={new Date().toISOString().slice(0, 7)}
            required
            className="w-full rounded-lg border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Set Budget
        </button>
      </form>
    </div>
  );
}

export function EditBudgetModal({
  budget,
  onCloseAction,
  onBudgetUpdatedAction
}: {
  budget: Budget,
  onCloseAction: () => void,
  onBudgetUpdatedAction?: () => void
}) {
  const { categories, refreshBudgets, setIsSaving } = useDashboard();

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    try {
      const res = await updateBudget(budget.id, formData);
      if (res?.error) {
        alert(res.error);
      } else {
        await refreshBudgets();
        if (onBudgetUpdatedAction) {
          onBudgetUpdatedAction();
        } else {
          onCloseAction();
        }
      }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "An unknown error occurred");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface p-8 rounded-3xl border border-surface-border shadow-2xl max-w-lg w-full">
        <h3 className="text-xl font-bold text-foreground mb-6">Edit Budget Limit</h3>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="category_id_edit" className="block text-sm font-medium text-foreground/80 mb-1">
              Category
            </label>
            <select
              name="category_id"
              id="category_id_edit"
              required
              defaultValue={budget.category_id}
              className="w-full rounded-lg border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
            >
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
            <label htmlFor="amount_edit" className="block text-sm font-medium text-foreground/80 mb-1">
              Monthly Limit
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">₹</span>
              <input
                type="number"
                step="0.01"
                name="amount"
                id="amount_edit"
                required
                defaultValue={budget.amount}
                className="w-full pl-8 rounded-lg border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="month_edit" className="block text-sm font-medium text-foreground/80 mb-1">
              Month
            </label>
            <input
              type="month"
              name="month"
              id="month_edit"
              required
              defaultValue={budget.month}
              className="w-full rounded-lg border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCloseAction}
              className="px-6 py-2 bg-background text-foreground/80 font-semibold rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
