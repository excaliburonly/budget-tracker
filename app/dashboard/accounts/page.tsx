"use client";

import { getAccounts } from "@/actions/accounts";
import { AddAccountForm, EditAccountModal } from "@/components/forms/AccountForms";
import { AccountCard } from "@/components/dashboard/AccountCard";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Account } from "@/types/database";
import { BanknotesIcon } from "@heroicons/react/24/outline";

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [currency, setCurrency] = useState('INR');
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);

    async function fetchData() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const { data: profile } = await supabase
            .from('profiles')
            .select('currency')
            .eq('id', user?.id)
            .single();

        setCurrency(profile?.currency || 'INR');

        const data = await getAccounts();
        setAccounts(data);
    }

    useEffect(() => {
        const init = async () => {
            await fetchData();
        };
        init();
    }, []);

    const refreshAccounts = async () => {
        const data = await getAccounts();
        setAccounts(data);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <BanknotesIcon className="w-8 h-8 text-primary" />
                        Bank Accounts
                    </h1>
                    <p className="text-text-muted mt-1">Manage your multiple bank accounts and their balances</p>
                </div>
            </header>

            <AddAccountForm onAccountAdded={refreshAccounts} />

            <section>
                <h3 className="text-lg font-semibold text-foreground mb-4">Your Accounts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accounts.length === 0 ? (
                        <div className="col-span-full py-10 text-center text-sm text-text-muted/60">
                            No accounts added yet.
                        </div>
                    ) : (
                        accounts.map((account) => (
                            <AccountCard
                                key={account.id}
                                account={account}
                                currency={currency}
                                onEdit={setEditingAccount}
                                onRefresh={refreshAccounts}
                            />
                        ))
                    )}
                </div>
            </section>

            {editingAccount && (
                <EditAccountModal
                    account={editingAccount}
                    onCloseAction={() => {
                        setEditingAccount(null);
                        refreshAccounts();
                    }}
                />
            )}
        </div>
    );
}
