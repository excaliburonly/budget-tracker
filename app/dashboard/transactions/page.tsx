"use client";

import {AddCategoryForm, AddTransactionForm, EditTransactionModal} from "@/components/forms/TransactionForms";
import {TransactionRow} from "@/components/dashboard/TransactionRow";
import {Transaction} from "@/types/database";
import {useState} from "react";
import {ArrowsRightLeftIcon} from "@heroicons/react/24/outline";
import {useDashboard} from "@/providers/dashboard-provider";

export default function TransactionsPage() {
    const {
        transactions, loading
    } = useDashboard();

    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    if (loading) {
        return <div className="p-8 text-center text-text-muted">Loading transactions...</div>;
    }

    return (<div className="max-w-6xl mx-auto">
            <header className="mb-10 flex items-center gap-3">
                <ArrowsRightLeftIcon className="w-8 h-8 text-primary"/>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
                    <p className="text-text-muted mt-1">Record every rupee and organize your finances with
                        categories</p>
                </div>
            </header>

            <AddTransactionForm/>

            <AddCategoryForm/>

            <section className="bg-surface rounded-3xl border border-surface-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-surface-border">
                        <thead className="bg-background">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-widest">Date
                                / Notes
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-widest">Category</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-widest">Account</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-widest">Amount</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-text-muted uppercase tracking-widest">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                        {transactions.length === 0 ? (<tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                                    No transactions yet. Start by adding one above.
                                </td>
                            </tr>) : (transactions.map((transaction) => (<TransactionRow
                                    key={transaction.id}
                                    transaction={transaction}
                                    onEdit={() => setEditingTransaction(transaction)}
                                />)))}
                        </tbody>
                    </table>
                </div>
            </section>

            {editingTransaction && (<EditTransactionModal
                    transaction={editingTransaction}
                    onClose={() => setEditingTransaction(null)}
                />)}
        </div>);
}
