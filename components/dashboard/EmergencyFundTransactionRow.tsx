"use client";

import { EmergencyFundTransaction } from "@/types/database";
import { formatCurrency, formatDate } from "@/utils/format";
import { useDashboard } from "@/providers/dashboard-provider";

interface EmergencyFundTransactionRowProps {
  transaction: EmergencyFundTransaction;
}

export function EmergencyFundTransactionRow({ transaction }: EmergencyFundTransactionRowProps) {
  const { currency } = useDashboard();
  
  return (
    <tr className="hover:bg-background/50 transition-colors group">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-foreground">{formatDate(transaction.date)}</div>
        <div className="text-xs text-text-muted">{transaction.transactions?.notes || '-'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-foreground font-medium">
          {transaction.emergency_funds?.name}
        </div>
        <div className="text-xs text-text-muted">
          {transaction.emergency_funds?.instrument_type}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          transaction.type === 'contribution' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
        }`}>
          {transaction.type.toUpperCase()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-foreground">
            {transaction.transactions?.accounts?.name || '-'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className={`text-sm font-bold ${
          transaction.type === 'contribution' ? 'text-primary' : 'text-orange-600'
        }`}>
          {transaction.type === 'contribution' ? '+' : '-'}
          {formatCurrency(transaction.amount, currency)}
        </div>
      </td>
    </tr>
  );
}
