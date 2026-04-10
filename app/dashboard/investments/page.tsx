"use client";

import {deleteInvestment, getInvestments} from "./actions";
import InvestmentForm, {EditInvestmentModal} from "./InvestmentForm";
import {Investment} from "@/types/database";
import {formatCurrency} from "@/utils/format";
import {createClient} from "@/utils/supabase/client";
import {useEffect, useState} from "react";

import {ChartBarIcon, PencilSquareIcon, TrashIcon} from "@heroicons/react/24/outline";

export default function InvestmentsPage() {
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [currency, setCurrency] = useState('INR');
    const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);

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

            const data = await getInvestments();
            setInvestments(data);
        }

        fetchData();
    }, []);

    const refreshInvestments = async () => {
        const data = await getInvestments();
        setInvestments(data);
    };

    const totalInvested = investments.reduce((acc, inv) => acc + (inv.quantity * inv.average_buy_price), 0);
    const totalValue = investments.reduce((acc, inv) => acc + Number(inv.current_value), 0);
    const totalGain = totalValue - totalInvested;
    const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    return (<div className="max-w-6xl mx-auto py-8">
            <header className="mb-10 flex items-center gap-3">
                <ChartBarIcon className="w-8 h-8 text-blue-600"/>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Investments</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Track your portfolio performance and assets</p>
                </div>
            </header>

            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div
                    className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Value</span>
                    <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                        {formatCurrency(totalValue, currency)}
                    </div>
                </div>
                <div
                    className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Invested</span>
                    <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                        {formatCurrency(totalInvested, currency)}
                    </div>
                </div>
                <div
                    className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Gain/Loss</span>
                    <div className={`text-3xl font-black mt-1 ${totalGain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(totalGain, currency)}
                        <span className="text-sm ml-2 font-bold">
              ({totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%)
            </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div
                        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead
                                className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Asset</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Qty</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Value</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Gain</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {investments.length === 0 ? (<tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                                        No investments added yet.
                                    </td>
                                </tr>) : (investments.map((inv) => {
                                    const invested = inv.quantity * inv.average_buy_price;
                                    const gain = inv.current_value - invested;
                                    const gainPercent = invested > 0 ? (gain / invested) * 100 : 0;

                                    return (<tr key={inv.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span
                                                        className="text-sm font-bold text-gray-900 dark:text-white">{inv.asset_name}</span>
                                                    <span
                                                        className="text-xs text-gray-500 font-mono">{inv.symbol || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 text-right font-medium">
                                                {inv.quantity}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {formatCurrency(Number(inv.current_value), currency)}
                                                </div>
                                                <div className="text-[10px] text-gray-400">
                                                    Avg: {formatCurrency(inv.average_buy_price, currency)}
                                                </div>
                                            </td>
                                            <td className={`px-6 py-4 text-right text-xs font-bold ${gain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                <div>{gain >= 0 ? '+' : ''}{formatCurrency(gain, currency)}</div>
                                                <div>{gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditingInvestment(inv)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                        title="Edit Investment"
                                                    >
                                                        <PencilSquareIcon className="w-4 h-4"/>
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm(`Delete ${inv.asset_name}?`)) {
                                                                await deleteInvestment(inv.id);
                                                                refreshInvestments();
                                                            }
                                                        }}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                                        title="Delete Investment"
                                                    >
                                                        <TrashIcon className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>);
                                }))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div>
                    <InvestmentForm/>
                </div>
            </div>

            {editingInvestment && (<EditInvestmentModal
                    investment={editingInvestment}
                    onCloseAction={() => {
                        setEditingInvestment(null);
                        refreshInvestments();
                    }}
                />)}
        </div>);
}
