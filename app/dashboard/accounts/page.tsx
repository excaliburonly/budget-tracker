"use client";

import {deleteAccount, getAccounts} from "./actions";
import {AddAccountForm, EditAccountModal} from "./AccountForms";
import {formatCurrency} from "@/utils/format";
import {createClient} from "@/utils/supabase/client";
import {useEffect, useState} from "react";
import {Account} from "@/types/database";
import {BanknotesIcon, PencilSquareIcon, TrashIcon} from "@heroicons/react/24/outline";

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [currency, setCurrency] = useState('INR');
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);

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

            const data = await getAccounts();
            setAccounts(data);
        }

        fetchData();
    }, []);

    const refreshAccounts = async () => {
        const data = await getAccounts();
        setAccounts(data);
    };

    return (<div className="max-w-6xl mx-auto">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <BanknotesIcon className="w-8 h-8 text-blue-600"/>
                        Bank Accounts
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your multiple bank accounts and their
                        balances</p>
                </div>
            </header>

            <AddAccountForm/>

            <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Accounts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accounts.length === 0 ? (<div className="col-span-full py-10 text-center text-sm text-gray-400">
                            No accounts added yet.
                        </div>) : (accounts.map((account) => (<div
                                key={account.id}
                                className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-md relative group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                    <span
                        className="text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                      {account.type}
                    </span>
                                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{account.name}</h4>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setEditingAccount(account)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title="Edit Account"
                                        >
                                            <PencilSquareIcon className="w-4 h-4"/>
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (confirm('Are you sure you want to delete this account?')) {
                                                    await deleteAccount(account.id);
                                                    refreshAccounts();
                                                }
                                            }}
                                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                            title="Delete Account"
                                        >
                                            <TrashIcon className="w-4 h-4"/>
                                        </button>
                                    </div>
                                </div>

                                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                                    {formatCurrency(account.balance, currency)}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Current Balance</p>
                            </div>)))}
                </div>
            </section>

            {editingAccount && (<EditAccountModal
                    account={editingAccount}
                    onCloseAction={() => {
                        setEditingAccount(null);
                        refreshAccounts();
                    }}
                />)}
        </div>);
}
