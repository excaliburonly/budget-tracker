"use client";

import { InvestmentTransaction } from "@/types/database";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { useDashboard } from "@/providers/dashboard-provider";

interface InvestmentTransactionRowProps {
  transaction: InvestmentTransaction;
}

export function InvestmentTransactionRow({ transaction }: InvestmentTransactionRowProps) {
  const { currency } = useDashboard();

  return (
    <tr className="hover:bg-background/50 transition-colors group">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-foreground">{formatDateTime(transaction.date)}</div>
        <div className="text-xs text-text-muted">{transaction.transactions?.notes || '-'}</div>
      </td>      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-foreground font-medium">
          {transaction.investments?.asset_name}
        </div>
        <div className="text-xs text-text-muted">
          {transaction.investments?.investment_type}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          transaction.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {transaction.type.toUpperCase()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-foreground">
          {transaction.quantity} @ {formatCurrency(transaction.price, currency)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-foreground">
            {transaction.transactions?.accounts?.name || '-'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className={`text-sm font-bold ${
          transaction.type === 'buy' ? 'text-red-600' : 'text-green-600'
        }`}>
          {transaction.type === 'buy' ? '-' : '+'}
          {formatCurrency(transaction.quantity * transaction.price, currency)}
        </div>
      </td>
    </tr>
  );
}
