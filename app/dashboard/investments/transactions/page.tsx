"use client";

import { InvestmentTransactionRow } from "@/components/dashboard/InvestmentTransactionRow";
import { ChartBarSquareIcon } from "@heroicons/react/24/outline";
import { useDashboard } from "@/providers/dashboard-provider";

export default function InvestmentTransactionsPage() {
    const {
        investmentTransactions, loading
    } = useDashboard();

    if (loading) {
        return <div className="p-8 text-center text-text-muted">Loading transactions...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-10 flex items-center gap-3">
                <ChartBarSquareIcon className="w-8 h-8 text-primary"/>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Investment Transactions</h1>
                    <p className="text-text-muted mt-1">History of all your buy and sell activities</p>
                </div>
            </header>

            <section className="bg-surface rounded-3xl border border-surface-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-surface-border">
                        <thead className="bg-background">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-widest">Date / Notes</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-widest">Asset</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-widest">Type</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-widest">Detail</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-widest">Account</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-text-muted uppercase tracking-widest">Value</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                        {investmentTransactions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                    No investment transactions found.
                                </td>
                            </tr>
                        ) : (
                            investmentTransactions.map((transaction) => (
                                <InvestmentTransactionRow
                                    key={transaction.id}
                                    transaction={transaction}
                                />
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
