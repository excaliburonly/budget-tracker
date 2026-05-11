"use client";

import { Account } from "@/types/database";
import { formatCurrency } from "@/utils/format";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { deleteAccount } from "@/actions/accounts";
import { useDashboard } from "@/providers/dashboard-provider";

interface AccountCardProps {
  account: Account;
  currency: string;
  onEditAction: (account: Account) => void;
  onRefreshAction: () => void;
}

export function AccountCard({ account, currency, onEditAction, onRefreshAction }: AccountCardProps) {
  const { showConfirmationAction } = useDashboard();

  const isCreditCard = account.type === "Credit Card";
  const isDebt = isCreditCard && account.balance < 0;
  const displayBalance = isDebt ? Math.abs(account.balance) : account.balance;

  const handleDelete = () => {
    showConfirmationAction({
      title: "Delete Account",
      message: `Are you sure you want to delete "${account.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      onConfirmAction: async () => {
        await deleteAccount(account.id);
        onRefreshAction();
      },
    });
  };

  return (
    <div className={`p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md relative group ${
      isDebt ? 'bg-red-50/30 border-red-200 dark:bg-red-900/10 dark:border-red-900/30' : 'bg-surface border-surface-border'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="min-w-0 pr-4">
          <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            isDebt ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' : 'bg-link-hover-bg text-primary'
          }`}>
            {account.type}
          </span>
          <h4 className="text-xl font-bold text-foreground mt-1 truncate" title={account.name}>{account.name}</h4>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onEditAction(account)}
            className="p-1.5 text-primary hover:bg-link-hover-bg rounded-lg transition-colors"
            title="Edit Account"
          >
            <PencilSquareIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-red-600 hover:bg-red-50/10 rounded-lg transition-colors"
            title="Delete Account"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={`text-2xl font-extrabold ${isDebt ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
        {formatCurrency(displayBalance, currency)}
      </div>
      <p className="text-xs text-text-muted/60 mt-1">
        {isDebt ? 'Amount Owed (Debt)' : 'Current Balance'}
      </p>

      {isCreditCard && (
        <div className="mt-4 pt-4 border-t border-surface-border/50 flex gap-2">
           <button 
             onClick={() => {
               // We can't easily open the transaction form from here without refactoring
               // But we can at least show a hint or maybe we'll add a 'Quick Pay' action later
             }}
             className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
           >
             Track Payment
           </button>
        </div>
      )}
    </div>
  );
}
