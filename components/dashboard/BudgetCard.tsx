"use client";

import { Budget } from "@/types/database";
import { formatCurrency } from "@/utils/format";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { deleteBudget } from "@/actions/budgets";

interface BudgetCardProps {
  budget: Budget;
  spent: number;
  currency: string;
  onEdit: (budget: Budget) => void;
  onRefresh: () => void;
}

export function BudgetCard({ budget, spent, currency, onEdit, onRefresh }: BudgetCardProps) {
  const percentage = Math.min((spent / budget.amount) * 100, 100);
  const isOver = spent > budget.amount;

  const handleDelete = async () => {
    if (confirm('Delete this budget limit?')) {
      await deleteBudget(budget.id);
      onRefresh();
    }
  };

  return (
    <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm relative group overflow-hidden">
      {isOver && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold uppercase tracking-wider">
          Over Budget
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: budget.categories?.color || '#3b82f6' }}
          >
            {budget.categories?.name?.charAt(0) || 'B'}
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{budget.categories?.name}</h4>
            <span className="text-xs text-text-muted">{budget.month}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 text-primary hover:bg-link-hover-bg rounded-lg transition-colors"
            title="Edit Budget"
          >
            <PencilSquareIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-red-600 hover:bg-red-50/10 rounded-lg transition-colors"
            title="Delete Budget"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Spent: {formatCurrency(spent, currency)}</span>
          <span className="text-foreground font-medium">Limit: {formatCurrency(Number(budget.amount), currency)}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-background rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out ${isOver ? 'bg-red-500' : percentage > 85 ? 'bg-amber-500' : 'bg-blue-500'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-xs font-medium text-text-muted/60">
            {Math.round(percentage)}% of limit used
          </span>
          {isOver && (
            <span className="text-xs font-bold text-red-500">
              +{formatCurrency(spent - budget.amount, currency)} over
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
