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
  onPayAction?: (account: Account) => void;
}

export function AccountCard({ account, currency, onEditAction, onRefreshAction, onPayAction }: AccountCardProps) {
  const { showConfirmationAction } = useDashboard();

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
    <div className="glass-panel hover-lift p-6 rounded-2xl relative group">
      <div className="flex justify-between items-start mb-4">
        <div className="min-w-0 pr-4">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/10">
            {account.type}
          </span>
          <h4 className="text-xl font-bold text-foreground mt-3.5 truncate" title={account.name}>{account.name}</h4>
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

      <div className="text-2xl font-extrabold text-foreground">
        {formatCurrency(account.balance, currency)}
      </div>
      {account.secondary_balance !== undefined && account.secondary_balance !== null && account.secondary_currency && (
        <div className="text-sm font-bold text-primary mt-1">
          {formatCurrency(account.secondary_balance, account.secondary_currency)}
        </div>
      )}
      <div className="flex justify-between items-end mt-1">
        <p className="text-xs text-text-muted/60">Current Balance</p>
        {account.account_category === 'debt' && onPayAction && (
          <button
            onClick={() => onPayAction(account)}
            className="text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary-hover bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-xl transition-all"
          >
            Log Payment
          </button>
        )}
      </div>
    </div>
  );
}
