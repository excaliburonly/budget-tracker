"use client";

import { Transaction } from "@/types/database";
import { formatCurrency } from "@/utils/format";
import { PencilSquareIcon, TrashIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { deleteTransaction } from "@/actions/transactions";
import { useDashboard } from "@/providers/dashboard-provider";

interface TransactionRowProps {
  transaction: Transaction;
  onEditAction: (transaction: Transaction) => void;
  onDeleteAction?: () => void;
}

export function TransactionRow({ transaction, onEditAction, onDeleteAction }: TransactionRowProps) {
  const { currency, refreshTransactions, setIsSaving, showConfirmationAction } = useDashboard();
  
  const handleDelete = () => {
    showConfirmationAction({
      title: "Delete Transaction",
      message: "Are you sure you want to delete this transaction? This action cannot be undone.",
      confirmText: "Delete",
      onConfirmAction: async () => {
        setIsSaving(true);
        try {
          await deleteTransaction(transaction.id);
          await refreshTransactions();
          if (onDeleteAction) onDeleteAction();
        } finally {
          setIsSaving(false);
        }
      },
    });
  };

  return (
    <tr className="hover:bg-background/50 transition-colors group">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-foreground">{transaction.date}</div>
        <div className="text-xs text-text-muted">{transaction.notes || '-'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {transaction.type === 'transfer' ? (
          <div className="flex items-center gap-1.5 text-indigo-600 font-medium text-sm">
            <ArrowsRightLeftIcon className="w-3.5 h-3.5" />
            Transfer
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: transaction.categories?.color || '#ccc' }}
            />
            <span className="text-sm text-foreground">
              {transaction.categories?.name || 'Uncategorized'}
            </span>
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-foreground font-medium">
          {transaction.accounts?.name || 'Unknown'}
          {transaction.type === 'transfer' && transaction.to_accounts && (
            <span className="text-text-muted font-normal ml-1">
              → {transaction.to_accounts.name}
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm font-bold ${
          transaction.type === 'income' ? 'text-green-600' : 
          transaction.type === 'transfer' ? 'text-indigo-600' : 'text-foreground'
        }`}>
          {transaction.type === 'income' ? '+' : transaction.type === 'transfer' ? '' : '-'}
          {formatCurrency(transaction.amount, currency)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEditAction(transaction)}
            className="p-1.5 text-primary hover:bg-link-hover-bg rounded-lg transition-colors"
          >
            < PencilSquareIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-red-600 hover:bg-red-50/10 rounded-lg transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
