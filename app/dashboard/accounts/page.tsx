"use client";

import { AddAccountForm, EditAccountModal, LogDebtPaymentModal } from "@/components/forms/AccountForms";
import { AccountCard } from "@/components/dashboard/AccountCard";
import { Account } from "@/types/database";
import { useState } from "react";
import { CreditCardIcon, BanknotesIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useDashboard } from "@/providers/dashboard-provider";
import AccountsPieChart from "@/components/charts/AccountsPieChart";

export default function AccountsPage() {
    const { 
        accounts, 
        currency, 
        loading, 
        refreshAccounts 
    } = useDashboard();

    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [payingAccount, setPayingAccount] = useState<Account | null>(null);

    const normalAccounts = accounts.filter(a => a.account_category === 'normal');
    const debtAccounts = accounts.filter(a => a.account_category === 'debt');

    // Prepare data for AccountsPieChart
    const accountChartData = accounts.map(a => ({
        name: a.name,
        value: Number(a.balance)
    }));

    if (loading) {
        return <div className="p-8 text-center text-text-muted">Loading accounts...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in-up">
            <header className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl w-fit">
                    <CreditCardIcon className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">My Accounts</h1>
                    <p className="text-text-muted mt-1 font-medium">Manage your bank accounts, wallets, and cash</p>
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

            <div className="space-y-12">
                {normalAccounts.length > 0 && (
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-xl">
                                <BanknotesIcon className="w-5 h-5 text-green-600" />
                            </div>
                            <h2 className="text-xl font-black text-foreground tracking-tight">Normal Accounts</h2>
                            <div className="flex-1 h-px bg-surface-border/50" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {normalAccounts.map((account) => (
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
                    </section>
                )}

                {debtAccounts.length > 0 && (
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/10 rounded-xl">
                                <ShieldCheckIcon className="w-5 h-5 text-red-600" />
                            </div>
                            <h2 className="text-xl font-black text-foreground tracking-tight">Debt Accounts</h2>
                            <div className="flex-1 h-px bg-surface-border/50" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {debtAccounts.map((account) => (
                                <div key={account.id} className="transition-all hover:-translate-y-1 duration-300">
                                    <AccountCard
                                        account={account}
                                        currency={currency}
                                        onEditAction={() => setEditingAccount(account)}
                                        onRefreshAction={refreshAccounts}
                                        onPayAction={() => setPayingAccount(account)}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}
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

            {payingAccount && (
                <LogDebtPaymentModal
                    debtAccount={payingAccount}
                    accounts={accounts}
                    onCloseAction={() => setPayingAccount(null)}
                    onPaymentLoggedAction={() => {
                        setPayingAccount(null);
                    }}
                />
            )}
        </div>
    );
}
