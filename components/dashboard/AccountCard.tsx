"use client";

import { Account } from "@/types/database";
import { formatCurrency } from "@/utils/format";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { deleteAccount } from "@/actions/accounts";

interface AccountCardProps {
  account: Account;
  currency: string;
  onEditAction: (account: Account) => void;
  onRefreshAction: () => void;
}

export function AccountCard({ account, currency, onEditAction, onRefreshAction }: AccountCardProps) {
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this account?')) {
      await deleteAccount(account.id);
      onRefreshAction();
    }
  };

  return (
    <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm transition-all hover:shadow-md relative group">
      <div className="flex justify-between items-start mb-4">
        <div className="min-w-0 pr-4">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-link-hover-bg px-2 py-0.5 rounded-full">
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

      <div className="text-2xl font-extrabold text-foreground">
        {formatCurrency(account.balance, currency)}
      </div>
      <p className="text-xs text-text-muted/60 mt-1">Current Balance</p>
    </div>
  );
}
