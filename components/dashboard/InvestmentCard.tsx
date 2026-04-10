"use client";

import { Investment } from "@/types/database";
import { formatCurrency } from "@/utils/format";
import { PencilSquareIcon, TrashIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/outline";
import { deleteInvestment } from "@/actions/investments";

interface InvestmentCardProps {
  investment: Investment;
  currency: string;
  onEdit: (investment: Investment) => void;
  onRefresh: () => void;
}

export function InvestmentCard({ investment, currency, onEdit, onRefresh }: InvestmentCardProps) {
  const totalCost = investment.quantity * investment.average_buy_price;
  const currentTotalValue = investment.quantity * investment.current_value;
  const pnl = currentTotalValue - totalCost;
  const pnlPercentage = (pnl / totalCost) * 100;
  const isPositive = pnl >= 0;

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this investment?')) {
      await deleteInvestment(investment.id);
      onRefresh();
    }
  };

  return (
    <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm transition-all hover:shadow-md relative group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-xl font-bold text-foreground">{investment.asset_name}</h4>
          {investment.symbol && (
            <span className="text-xs font-mono font-semibold text-text-muted/60 uppercase bg-background px-1.5 py-0.5 rounded">
              {investment.symbol}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(investment)}
            className="p-1.5 text-primary hover:bg-link-hover-bg rounded-lg transition-colors"
            title="Edit Investment"
          >
            <PencilSquareIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-red-600 hover:bg-red-50/10 rounded-lg transition-colors"
            title="Delete Investment"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-[10px] text-text-muted/60 uppercase font-bold tracking-wider">Value</p>
          <div className="text-lg font-bold text-foreground">
            {formatCurrency(currentTotalValue, currency)}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-text-muted/60 uppercase font-bold tracking-wider">Returns</p>
          <div className={`text-lg font-bold flex items-center justify-end gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <ArrowTrendingUpIcon className="w-4 h-4" /> : <ArrowTrendingDownIcon className="w-4 h-4" />}
            {formatCurrency(Math.abs(pnl), currency)}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-surface-border flex justify-between items-center">
        <div className="text-xs text-text-muted">
          Qty: <span className="font-semibold text-foreground">{investment.quantity}</span>
        </div>
        <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
          {isPositive ? '+' : ''}{pnlPercentage.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}
