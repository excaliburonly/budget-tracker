"use client";

import { getInvestments } from "@/actions/investments";
import { AddInvestmentForm, EditInvestmentModal } from "@/components/forms/InvestmentForms";
import { InvestmentCard } from "@/components/dashboard/InvestmentCard";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { Investment } from "@/types/database";
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "@/utils/format";

export default function InvestmentsPage() {
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [currency, setCurrency] = useState('INR');
    const [loading, setLoading] = useState(true);
    const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);

    const fetchData = useCallback(async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const { data: profile } = await supabase
            .from('profiles')
            .select('currency')
            .eq('id', user?.id)
            .single();

        setCurrency(profile?.currency || 'INR');

        const data = await getInvestments();
        setInvestments(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        const init = async () => {
            await fetchData();
        };
        init();
    }, [fetchData]);

    const refreshInvestments = () => {
        fetchData();
    };

    const totalPortfolioValue = investments.reduce((acc, inv) => acc + (inv.quantity * inv.current_value), 0);
    const totalInvestedValue = investments.reduce((acc, inv) => acc + (inv.quantity * inv.average_buy_price), 0);
    const totalPnl = totalPortfolioValue - totalInvestedValue;
    const isTotalPositive = totalPnl >= 0;

    if (loading) {
        return <div className="p-8 text-center text-text-muted">Loading investments...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                    <ChartBarIcon className="w-8 h-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Investment Portfolio</h1>
                        <p className="text-text-muted mt-1">Track your assets, holdings, and overall performance</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm">
                        <p className="text-xs font-bold text-text-muted/60 uppercase tracking-widest mb-1">Total Current Value</p>
                        <div className="text-2xl font-black text-foreground">{formatCurrency(totalPortfolioValue, currency)}</div>
                    </div>
                    <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm">
                        <p className="text-xs font-bold text-text-muted/60 uppercase tracking-widest mb-1">Total Invested</p>
                        <div className="text-2xl font-black text-foreground">{formatCurrency(totalInvestedValue, currency)}</div>
                    </div>
                    <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm">
                        <p className="text-xs font-bold text-text-muted/60 uppercase tracking-widest mb-1">Overall Returns</p>
                        <div className={`text-2xl font-black flex items-center gap-2 ${isTotalPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isTotalPositive ? <ArrowTrendingUpIcon className="w-6 h-6" /> : <ArrowTrendingDownIcon className="w-6 h-6" />}
                            {formatCurrency(Math.abs(totalPnl), currency)}
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-foreground">Holdings</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {investments.length === 0 ? (
                            <div className="col-span-full bg-surface rounded-2xl border border-dashed border-input-border h-48 flex flex-col items-center justify-center p-6 text-center">
                                <p className="text-text-muted">Your portfolio is empty.</p>
                                <p className="text-sm text-text-muted/60 mt-1">Start by adding your first asset investment.</p>
                            </div>
                        ) : (
                            investments.map((investment) => (
                                <InvestmentCard
                                    key={investment.id}
                                    investment={investment}
                                    currency={currency}
                                    onEdit={setEditingInvestment}
                                    onRefresh={refreshInvestments}
                                />
                            ))
                        )}
                    </div>
                </div>

                <div>
                    <AddInvestmentForm onInvestmentAdded={refreshInvestments} />
                </div>
            </div>

            {editingInvestment && (
                <EditInvestmentModal
                    investment={editingInvestment}
                    onCloseAction={() => {
                        setEditingInvestment(null);
                        refreshInvestments();
                    }}
                />
            )}
        </div>
    );
}
