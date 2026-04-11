"use client";

import { AddAccountForm, EditAccountModal } from "@/components/forms/AccountForms";
import { AccountCard } from "@/components/dashboard/AccountCard";
import { Account } from "@/types/database";
import { useState } from "react";
import { CreditCardIcon } from "@heroicons/react/24/outline";
import { useDashboard } from "@/providers/dashboard-provider";

export default function AccountsPage() {
    const { 
        accounts, 
        currency, 
        loading, 
        refreshAccounts 
    } = useDashboard();
    
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);

    if (loading) {
        return <div className="p-8 text-center text-text-muted">Loading accounts...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-10 flex items-center gap-3">
                <CreditCardIcon className="w-8 h-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold text-foreground">My Accounts</h1>
                    <p className="text-text-muted mt-1">Manage your bank accounts, wallets, and cash</p>
                </div>
            </header>

            <AddAccountForm />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((account) => (
                    <AccountCard
                        key={account.id}
                        account={account}
                        currency={currency}
                        onEditAction={() => setEditingAccount(account)}
                        onRefreshAction={refreshAccounts}
                    />
                ))}
            </div>
            
            {accounts.length === 0 && (
                <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-input-border">
                    <p className="text-text-muted">No accounts added yet.</p>
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
