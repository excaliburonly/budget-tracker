"use client";

import { getAccounts, getCategories, getEmergencyFunds, getInvestments, getTransactions } from "@/actions/transactions";
import { AddCategoryForm, AddTransactionForm, EditTransactionModal } from "@/components/forms/TransactionForms";
import { TransactionRow } from "@/components/dashboard/TransactionRow";
import { Account, Category, EmergencyFund, Investment, Transaction } from "@/types/database";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [emergencyFunds, setEmergencyFunds] = useState<EmergencyFund[]>([]);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [currency, setCurrency] = useState('INR');
    const [loading, setLoading] = useState(true);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const fetchData = useCallback(async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const { data: profile } = await supabase
            .from('profiles')
            .select('currency')
            .eq('id', user?.id)
            .single();

        setCurrency(profile?.currency || 'INR');

        const [txs, cats, accs, funds, invs] = await Promise.all([
            getTransactions(),
            getCategories(),
            getAccounts(),
            getEmergencyFunds(),
            getInvestments()
        ]);

        setTransactions(txs);
        setCategories(cats);
        setAccounts(accs);
        setEmergencyFunds(funds);
        setInvestments(invs);
        setLoading(false);
    }, []);

    useEffect(() => {
        const init = async () => {
            await fetchData();
        };
        init();
    }, [fetchData]);

    const refreshData = () => {
        fetchData();
    };

    if (loading) {
        return <div className="p-8 text-center text-text-muted">Loading transactions...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-10 flex items-center gap-3">
                <ArrowsRightLeftIcon className="w-8 h-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
                    <p className="text-text-muted mt-1">Record every rupee and organize your finances with categories</p>
                </div>
            </header>

            <AddTransactionForm
                categories={categories}
                accounts={accounts}
                emergencyFunds={emergencyFunds}
                investments={investments}
                onTransactionAdded={refreshData}
            />

            <AddCategoryForm categories={categories} onCategoryChange={refreshData} />

            <section className="bg-surface rounded-3xl border border-surface-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-surface-border">
                        <thead className="bg-background">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-widest">Date / Notes</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-widest">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-widest">Account</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-text-muted uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-text-muted/60">
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((transaction) => (
                                    <TransactionRow
                                        key={transaction.id}
                                        transaction={transaction}
                                        currency={currency}
                                        onEdit={setEditingTransaction}
                                        onRefresh={refreshData}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {editingTransaction && (
                <EditTransactionModal
                    transaction={editingTransaction}
                    categories={categories}
                    accounts={accounts}
                    emergencyFunds={emergencyFunds}
                    investments={investments}
                    onCloseAction={() => {
                        setEditingTransaction(null);
                        refreshData();
                    }}
                />
            )}
        </div>
    );
}
