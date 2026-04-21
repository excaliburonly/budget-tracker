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

    return (<div className="max-w-7xl mx-auto space-y-10 animate-fade-in-up pb-10">
            <header className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl w-fit">
                    <ArrowsRightLeftIcon className="w-8 h-8 text-primary"/>
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Transactions</h1>
                    <p className="text-text-muted mt-1 font-medium">Record every rupee and organize your finances with categories</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <AddTransactionForm/>
                <AddCategoryForm/>
            </div>

            <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm">
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
            </div>

            <section className="bg-surface/80 backdrop-blur-sm rounded-[2rem] border border-surface-border/50 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-surface-border/30">
                        <thead className="bg-background/50">
                        <tr>
                            <th className="px-6 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Date / Notes</th>
                            <th className="px-6 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Category</th>
                            <th className="px-6 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Account</th>
                            <th className="px-6 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Amount</th>
                            <th className="px-6 py-5 text-right text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border/20">
                        {filteredTransactions.length === 0 ? (<tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-text-muted">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center">
                                            <ArrowsRightLeftIcon className="w-6 h-6 opacity-20" />
                                        </div>
                                        <p className="font-bold tracking-tight">
                                            {transactions.length === 0 
                                                ? "No transactions yet. Start by adding one above." 
                                                : "No transactions match your filters."}
                                        </p>
                                    </div>
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
