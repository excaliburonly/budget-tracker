"use client";

import { AddAccountForm, EditAccountModal } from "@/components/forms/AccountForms";
import { AccountCard } from "@/components/dashboard/AccountCard";
import { Account } from "@/types/database";
import { useState } from "react";
import { CreditCardIcon } from "@heroicons/react/24/outline";
import { useDashboard } from "@/providers/dashboard-provider";
import AccountsPieChart from "@/components/charts/AccountsPieChart";
import { formatCurrency } from "@/utils/format";

export default function AccountsPage() {
    const { 
        accounts, 
        currency, 
        loading, 
        refreshAccounts 
    } = useDashboard();
    
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);

    // Prepare data for AccountsPieChart
    const accountChartData = accounts.map(a => ({
        name: a.name,
        value: Math.abs(Number(a.balance))
    }));

    const totalAssets = accounts
        .filter(a => a.type !== 'Credit Card' || a.balance > 0)
        .reduce((sum, a) => sum + Number(a.balance), 0);
    
    const totalDebt = accounts
        .filter(a => a.type === 'Credit Card' && a.balance < 0)
        .reduce((sum, a) => sum + Math.abs(Number(a.balance)), 0);

    if (loading) {
        return <div className="p-8 text-center text-text-muted">Loading accounts...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in-up">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl w-fit">
                        <CreditCardIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">My Accounts</h1>
                        <p className="text-text-muted mt-1 font-medium">Manage your bank accounts, wallets, and cash</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="bg-surface p-4 rounded-2xl border border-surface-border text-right min-w-[150px]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Total Assets</p>
                        <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalAssets, currency)}</p>
                    </div>
                    {totalDebt > 0 && (
                        <div className="bg-red-50/50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/20 text-right min-w-[150px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 mb-1">Total Debt</p>
                            <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalDebt, currency)}</p>
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm h-full flex flex-col">
                        <h3 className="text-lg font-black text-foreground mb-6 tracking-tight flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            Asset Distribution
                        </h3>
                        <div className="flex-1 min-h-[300px]">
                            <AccountsPieChart data={accountChartData} currency={currency} />
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <AddAccountForm />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((account) => (
                    <div key={account.id} className="transition-all hover:-translate-y-1 duration-300">
                        <AccountCard
                            account={account}
                            currency={currency}
                            onEditAction={() => setEditingAccount(account)}
                            onRefreshAction={refreshAccounts}
                        />
                    </div>
                ))}
            </div>
            
            {accounts.length === 0 && (
                <div className="text-center py-24 bg-surface/40 rounded-[2.5rem] border-2 border-dashed border-surface-border/50">
                    <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CreditCardIcon className="w-8 h-8 text-text-muted" />
                    </div>
                    <p className="text-text-muted font-bold">No accounts found</p>
                    <p className="text-xs text-text-muted mt-1">Add your first account above to get started.</p>
                </div>
            )}

            {editingAccount && (
                <EditAccountModal
                    account={editingAccount}
                    onCloseAction={() => setEditingAccount(null)}
                    onAccountUpdatedAction={() => {
                        setEditingAccount(null);
                    }}
                />
            )}
        </div>
    );
}
