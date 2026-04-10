"use client";

import {deleteTransaction, getCategories, getTransactions} from "./actions";
import {getEmergencyFunds} from "../emergency-funds/actions";
import {getInvestments} from "../investments/actions";
import {getAccounts} from "../accounts/actions";
import {AddCategoryForm, AddTransactionForm, EditTransactionModal} from "./TransactionForms";
import {Account, Category, EmergencyFund, Investment, Transaction} from "@/types/database";
import {formatCurrency} from "@/utils/format";
import {createClient} from "@/utils/supabase/client";
import {useEffect, useState} from "react";

import {ArrowsRightLeftIcon, PencilSquareIcon, TrashIcon} from "@heroicons/react/24/outline";

export default function TransactionsPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [emergencyFunds, setEmergencyFunds] = useState<EmergencyFund[]>([]);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [currency, setCurrency] = useState('INR');
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    useEffect(() => {
        async function fetchData() {
            const supabase = createClient();
            const {data: {user}} = await supabase.auth.getUser();

            const {data: profile} = await supabase
                .from('profiles')
                .select('currency')
                .eq('id', user?.id)
                .single();

            setCurrency(profile?.currency || 'INR');

            const [cats, trans, funds, invs, accs] = await Promise.all([getCategories(), getTransactions(), getEmergencyFunds(), getInvestments(), getAccounts()]);

            setCategories(cats);
            setTransactions(trans);
            setEmergencyFunds(funds);
            setInvestments(invs);
            setAccounts(accs);
        }

        fetchData();
    }, []);

    const refreshData = async () => {
        const [cats, trans, funds, invs, accs] = await Promise.all([getCategories(), getTransactions(), getEmergencyFunds(), getInvestments(), getAccounts()]);
        setCategories(cats);
        setTransactions(trans);
        setEmergencyFunds(funds);
        setInvestments(invs);
        setAccounts(accs);
    };

    return (<div className="max-w-6xl mx-auto">
            <header className="mb-10 flex items-center gap-3">
                <ArrowsRightLeftIcon className="w-8 h-8 text-primary"/>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
                    <p className="text-text-muted mt-1">Manage your income and expenses</p>
                </div>
            </header>

            <AddCategoryForm categories={categories}/>
            <AddTransactionForm
                categories={categories}
                emergencyFunds={emergencyFunds}
                investments={investments}
                accounts={accounts}
            />

            <section>
                <h3 className="text-lg font-semibold text-foreground mb-4">History</h3>
                <div
                    className="bg-surface rounded-2xl border border-surface-border shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-background/50 border-b border-surface-border">
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Details</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Account</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Amount</th>
                            <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                        {transactions.length === 0 ? (<tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-sm text-text-muted/60">
                                    No transactions yet.
                                </td>
                            </tr>) : (transactions.map((t: Transaction) => (<tr key={t.id}
                                                                                className="hover:bg-background/30 transition-colors group">
                                    <td className="px-6 py-4 text-sm text-text-muted">
                                        {new Date(t.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {t.type === 'transfer' ? (<span
                                  className="text-primary font-bold">Transfer</span>) : (t.notes || '-')}
                        </span>
                                            {t.type !== 'transfer' && (<span
                                                    className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit"
                                                    style={{
                                                        backgroundColor: t.categories?.color ? `${t.categories.color}15` : '#f3f4f6',
                                                        color: t.categories?.color || '#374151'
                                                    }}
                                                >
                            {t.categories?.name || 'Uncategorized'}
                          </span>)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                        <span className="text-sm text-foreground/80">
                          {t.accounts?.name || 'Unknown'}
                        </span>
                                            {t.type === 'transfer' && (<span className="text-xs text-text-muted/60">
                            → {t.to_accounts?.name || 'Unknown'}
                          </span>)}
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 text-sm font-bold text-right ${t.type === 'income' ? 'text-emerald-600' : t.type === 'expense' ? 'text-red-600' : 'text-text-muted'}`}>
                                        {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}{formatCurrency(Number(t.amount), currency)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setEditingTransaction(t)}
                                                className="p-1.5 text-primary hover:bg-link-hover-bg rounded-lg transition-colors"
                                                title="Edit Transaction"
                                            >
                                                <PencilSquareIcon className="w-4 h-4"/>
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (confirm('Delete this transaction?')) {
                                                        await deleteTransaction(t.id);
                                                        refreshData();
                                                    }
                                                }}
                                                className="p-1.5 text-red-600 hover:bg-red-50/10 rounded-lg transition-colors"
                                                title="Delete Transaction"
                                            >
                                                <TrashIcon className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>)))}
                        </tbody>
                    </table>
                </div>
            </section>

            {editingTransaction && (<EditTransactionModal
                    transaction={editingTransaction}
                    categories={categories}
                    emergencyFunds={emergencyFunds}
                    investments={investments}
                    accounts={accounts}
                    onCloseAction={() => {
                        setEditingTransaction(null);
                        refreshData();
                    }}
                />)}
        </div>);
}
