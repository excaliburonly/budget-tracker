"use client";

import {AddCategoryForm, AddTransactionForm, EditTransactionModal} from "@/components/forms/TransactionForms";
import {TransactionRow} from "@/components/dashboard/TransactionRow";
import {Transaction} from "@/types/database";
import {useState, useMemo} from "react";
import {ArrowsRightLeftIcon} from "@heroicons/react/24/outline";
import {useDashboard} from "@/providers/dashboard-provider";
import {TransactionFilters} from "@/components/dashboard/TransactionFilters";

export default function TransactionsPage() {
    const {
        transactions, loading, accounts, categories
    } = useDashboard();

    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    // Filter states
    const [search, setSearch] = useState("");
    const [selectedAccountId, setSelectedAccountId] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const filteredTransactions = useMemo(() => {
        return transactions.filter((t) => {
            // Search filter
            if (search && !t.notes?.toLowerCase().includes(search.toLowerCase())) {
                return false;
            }

            // Account filter
            if (selectedAccountId && t.account_id !== selectedAccountId && t.to_account_id !== selectedAccountId) {
                return false;
            }

            // Category filter
            if (selectedCategoryId && t.category_id !== selectedCategoryId) {
                return false;
            }

            // Type filter
            if (selectedType && t.type !== selectedType) {
                return false;
            }

            // Date range filter
            if (startDate && new Date(t.date) < new Date(startDate)) {
                return false;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                if (new Date(t.date) > end) {
                    return false;
                }
            }

            return true;
        });
    }, [transactions, search, selectedAccountId, selectedCategoryId, selectedType, startDate, endDate]);

    const clearFilters = () => {
        setSearch("");
        setSelectedAccountId("");
        setSelectedCategoryId("");
        setSelectedType("");
        setStartDate("");
        setEndDate("");
    };

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

            <TransactionFilters
                accounts={accounts}
                categories={categories}
                search={search}
                onSearchChangeAction={setSearch}
                selectedAccountId={selectedAccountId}
                onAccountChangeAction={setSelectedAccountId}
                selectedCategoryId={selectedCategoryId}
                onCategoryChangeAction={setSelectedCategoryId}
                selectedType={selectedType}
                onTypeChangeAction={setSelectedType}
                startDate={startDate}
                onStartDateChangeAction={setStartDate}
                endDate={endDate}
                onEndDateChangeAction={setEndDate}
                onClearAction={clearFilters}
            />

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
                        {filteredTransactions.length === 0 ? (<tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                                    {transactions.length === 0 
                                        ? "No transactions yet. Start by adding one above." 
                                        : "No transactions match your filters."}
                                </td>
                            </tr>) : (filteredTransactions.map((transaction) => (<TransactionRow
                                    key={transaction.id}
                                    transaction={transaction}
                                    onEditAction={() => setEditingTransaction(transaction)}
                                />)))}
                        </tbody>
                    </table>
                </div>
            </section>

            {editingTransaction && (<EditTransactionModal
                    transaction={editingTransaction}
                    onCloseAction={() => setEditingTransaction(null)}
                />)}
        </div>);
}
