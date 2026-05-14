"use client";

import {AddCategoryForm, AddTransactionForm, EditTransactionModal, BulkEditModal} from "@/components/forms/TransactionForms";
import {TransactionRow} from "@/components/dashboard/TransactionRow";
import {Transaction} from "@/types/database";
import {useState, useMemo} from "react";
import {ArrowsRightLeftIcon, PencilIcon} from "@heroicons/react/24/outline";
import {useDashboard} from "@/providers/dashboard-provider";
import {TransactionFilters} from "@/components/dashboard/TransactionFilters";
import { LoadingSpinner } from "@/components/theme/Loading";

export default function TransactionsPage() {
    const {
        transactions, loading, accounts, categories
    } = useDashboard();

    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkEditing, setIsBulkEditing] = useState(false);

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

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredTransactions.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredTransactions.map(t => t.id));
        }
    };

    const clearFilters = () => {
        setSearch("");
        setSelectedAccountId("");
        setSelectedCategoryId("");
        setSelectedType("");
        setStartDate("");
        setEndDate("");
        setSelectedIds([]);
    };

    if (loading) {
        return <div className="p-20"><LoadingSpinner label="Loading transactions..." /></div>;
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

            <section className="bg-surface/80 backdrop-blur-sm rounded-[2rem] border border-surface-border/50 shadow-xl overflow-hidden relative">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-surface-border/30">
                        <thead className="bg-background/50">
                        <tr>
                            <th className="px-6 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                                <div className="flex items-center gap-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length > 0 && selectedIds.length === filteredTransactions.length}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-surface-border/50 text-primary focus:ring-primary/20 bg-background/50 cursor-pointer"
                                    />
                                    Date / Notes
                                </div>
                            </th>
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
                                    isSelected={selectedIds.includes(transaction.id)}
                                    onToggleSelectionAction={toggleSelection}
                                />)))}
                        </tbody>
                    </table>
                </div>

                {/* Bulk Actions Floating Bar */}
                {selectedIds.length > 0 && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-foreground text-background px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-6 animate-fade-in-up border border-white/10">
                        <span className="text-sm font-black uppercase tracking-widest border-r border-white/10 pr-6">
                            {selectedIds.length} Selected
                        </span>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsBulkEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-xs font-black uppercase tracking-widest"
                            >
                                <PencilIcon className="w-4 h-4" />
                                Bulk Edit
                            </button>
                            <button
                                onClick={() => setSelectedIds([])}
                                className="px-4 py-2 text-xs font-black uppercase tracking-widest opacity-50 hover:opacity-100"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {editingTransaction && (<EditTransactionModal
                    transaction={editingTransaction}
                    onCloseAction={() => setEditingTransaction(null)}
                />)}

            {isBulkEditing && (
                <BulkEditModal
                    selectedIds={selectedIds}
                    onCloseAction={() => setIsBulkEditing(false)}
                    onCompleteAction={() => {
                        setIsBulkEditing(false);
                        setSelectedIds([]);
                    }}
                />
            )}
        </div>);
}
