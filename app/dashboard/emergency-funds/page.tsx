"use client";

import {deleteEmergencyFund, getEmergencyFunds} from "./actions";
import {AddEmergencyFundForm, EditEmergencyFundModal} from "./EmergencyFundForm";
import {EmergencyFund} from "@/types/database";
import {formatCurrency} from "@/utils/format";
import {createClient} from "@/utils/supabase/client";
import {useEffect, useState} from "react";

import {PencilSquareIcon, ShieldCheckIcon, TrashIcon} from "@heroicons/react/24/outline";

export default function EmergencyFundsPage() {
    const [funds, setFunds] = useState<EmergencyFund[]>([]);
    const [currency, setCurrency] = useState('INR');
    const [editingFund, setEditingFund] = useState<EmergencyFund | null>(null);

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

            const data = await getEmergencyFunds();
            setFunds(data);
        }

        fetchData();
    }, []);

    const refreshFunds = async () => {
        const data = await getEmergencyFunds();
        setFunds(data);
    };

    const totalCurrentAmount = funds.reduce((acc, f) => acc + Number(f.current_amount), 0);
    const totalTargetAmount = funds.reduce((acc, f) => acc + Number(f.target_amount), 0);
    const totalPercentage = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

    return (<div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <header className="mb-10 flex items-center gap-3">
                <ShieldCheckIcon className="w-8 h-8 text-primary"/>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Emergency Funds</h1>
                    <p className="text-text-muted mt-1">Track your security buffer across different
                        financial instruments</p>
                </div>
            </header>

            {/* Global Progress Overview */}
            <section
                className="bg-surface rounded-3xl border border-surface-border p-8 shadow-sm mb-10 overflow-hidden relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Total Progress</h3>
                        <p className="text-sm text-text-muted">Combined balance of all emergency funds</p>
                    </div>
                    <div className="text-right">
            <span className="text-4xl font-extrabold text-emerald-600 tracking-tight">
              {formatCurrency(totalCurrentAmount, currency)}
            </span>
                        <p className="text-sm text-text-muted/60 mt-1">
                            Goal: {formatCurrency(totalTargetAmount, currency)}
                        </p>
                    </div>
                </div>

                <div className="w-full bg-background rounded-full h-4 overflow-hidden mb-2">
                    <div
                        className="h-full bg-emerald-500 transition-all duration-1000 ease-in-out relative shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        style={{width: `${Math.min(totalPercentage, 100)}%`}}
                    />
                </div>
                <div
                    className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-emerald-600">
                    <span>{totalPercentage.toFixed(1)}% Completed</span>
                    <span>{totalPercentage >= 100 ? "Goal Reached!" : `${(100 - totalPercentage).toFixed(1)}% to go`}</span>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-bold text-foreground mb-6 uppercase tracking-wider flex items-center gap-2">
                        Fund Instruments
                    </h3>

                    {funds.length === 0 ? (<div
                            className="bg-surface rounded-2xl border border-dashed border-input-border h-48 flex flex-col items-center justify-center p-6 text-center">
                            <p className="text-text-muted">No emergency funds created yet.</p>
                            <p className="text-sm text-text-muted/60 mt-1">Start by defining where you park your emergency
                                money.</p>
                        </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {funds.map((fund: EmergencyFund) => {
                                const percentage = Math.min((Number(fund.current_amount) / Number(fund.target_amount)) * 100, 100);

                                return (<div key={fund.id}
                                             className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm flex flex-col justify-between group relative">
                                        <div>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex flex-col gap-1">
                                                    <span
                                                        className="text-[10px] font-bold uppercase tracking-widest text-blue-500">{fund.instrument_type}</span>
                                                    <h4 className="font-bold text-foreground text-lg leading-tight">{fund.name}</h4>
                                                    <span
                                                        className="text-xs text-text-muted font-medium">{fund.institution_name || 'Personal Custody'}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => setEditingFund(fund)}
                                                        className="p-1 text-primary hover:bg-link-hover-bg rounded-md transition-colors"
                                                        title="Edit Fund"
                                                    >
                                                        <PencilSquareIcon className="w-3.5 h-3.5"/>
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm('Delete this fund goal?')) {
                                                                await deleteEmergencyFund(fund.id);
                                                                refreshFunds();
                                                            }
                                                        }}
                                                        className="p-1 text-red-600 hover:bg-red-50/10 rounded-md transition-colors"
                                                        title="Delete Fund"
                                                    >
                                                        <TrashIcon className="w-3.5 h-3.5"/>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex justify-between text-sm mb-2 pt-4">
                                                <span className="text-text-muted">Balance</span>
                                                <span
                                                    className="text-foreground font-bold">{formatCurrency(Number(fund.current_amount), currency)}</span>
                                            </div>
                                            <div
                                                className="w-full bg-background rounded-full h-1.5 overflow-hidden mb-6">
                                                <div
                                                    className="h-full bg-blue-500 transition-all duration-500"
                                                    style={{width: `${percentage}%`}}
                                                />
                                            </div>
                                        </div>

                                        <div
                                            className="pt-4 border-t border-surface-border flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span
                                                    className="text-[10px] text-text-muted/60 uppercase font-bold tracking-tighter">Target</span>
                                                <span
                                                    className="text-xs font-bold text-text-muted">{formatCurrency(Number(fund.target_amount), currency)}</span>
                                            </div>
                                            <div className="text-right">
                         <span
                             className="px-2 py-0.5 bg-link-hover-bg text-primary dark:text-blue-400 rounded text-[10px] font-extrabold">
                            {percentage.toFixed(0)}% READY
                         </span>
                                            </div>
                                        </div>
                                    </div>);
                            })}
                        </div>)}
                </div>

                <div>
                    <AddEmergencyFundForm/>
                    <div
                        className="mt-8 p-6 bg-primary/10 rounded-2xl border border-primary/20">
                        <h4 className="text-sm font-bold text-primary mb-2">💡 Pro-tip</h4>
                        <p className="text-xs text-primary/80 leading-relaxed">
                            When adding a transaction, select an Emergency Fund to automatically update its balance.
                            This helps you track transfers to your security buffer in real-time.
                        </p>
                    </div>
                </div>
            </div>

            {editingFund && (<EditEmergencyFundModal
                    fund={editingFund}
                    onCloseAction={() => {
                        setEditingFund(null);
                        refreshFunds();
                    }}
                />)}
        </div>);
}
