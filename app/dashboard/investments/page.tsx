"use client";

import { AddInvestmentForm, EditInvestmentModal } from "@/components/forms/InvestmentForms";
import { InvestmentCard } from "@/components/dashboard/InvestmentCard";
import { Investment } from "@/types/database";
import { useState, useMemo } from "react";
import { ChartBarSquareIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useDashboard } from "@/providers/dashboard-provider";
import { formatCurrency } from "@/utils/format";
import Link from "next/link";
import { syncMutualFundNAVs, syncStockPrices } from "@/actions/investments";
import { LoadingSpinner } from "@/components/theme/Loading";

export default function InvestmentsPage() {
    const { 
        investments, 
        currency, 
        loading, 
        refreshInvestments 
    } = useDashboard();
    
    const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await Promise.all([
                syncMutualFundNAVs(),
                syncStockPrices()
            ]);
            refreshInvestments();
        } catch (error) {
            console.error("Failed to sync prices:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    const totalPortfolioValue = useMemo(() => {
        return investments.reduce((sum, inv) => sum + (inv.current_value * inv.quantity), 0);
    }, [investments]);

    const investmentsByType = useMemo(() => {
        return investments.reduce((acc, inv) => {
            if (!acc[inv.investment_type]) {
                acc[inv.investment_type] = [];
            }
            acc[inv.investment_type].push(inv);
            return acc;
        }, {} as Record<string, Investment[]>);
    }, [investments]);

    if (loading) {
        return <div className="p-20"><LoadingSpinner label="Loading investments..." /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in-up">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                        <ChartBarSquareIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Investments</h1>
                        <p className="text-text-muted mt-1 font-medium">Grow your wealth and track your assets</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href="/dashboard/investments/sips"
                        className="px-6 py-3 bg-background border border-surface-border text-xs font-black uppercase tracking-widest text-text-muted hover:text-primary hover:border-primary/30 rounded-2xl transition-all flex items-center gap-2"
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                        SIP Dashboard
                    </Link>
                    <div className="bg-surface/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-surface-border/50 shadow-sm">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Portfolio Value</p>
                        <p className="text-xl font-black text-primary tracking-tight">{formatCurrency(totalPortfolioValue, currency)}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-12">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-foreground tracking-tight">Asset Distribution</h2>
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className="flex items-center gap-2 px-4 py-2 bg-background hover:bg-surface-hover text-[10px] font-black uppercase tracking-widest text-text-muted border border-surface-border rounded-xl transition-all disabled:opacity-50"
                        >
                            <ArrowPathIcon className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? 'Syncing...' : 'Sync Prices'}
                        </button>
                    </div>

                    {Object.entries(investmentsByType).map(([type, typeInvestments]) => (
                        <section key={type} className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <h3 className="text-lg font-black text-foreground tracking-tight">{type}</h3>
                                <div className="flex-1 h-px bg-surface-border/50" />
                                <Link 
                                    href={`/dashboard/investments/${type.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-hover"
                                >
                                    View Details →
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {typeInvestments.map((investment) => (
                                    <div key={investment.id} className="transition-all hover:-translate-y-1 duration-300">
                                        <InvestmentCard
                                            investment={investment}
                                            currency={currency}
                                            onEditAction={() => setEditingInvestment(investment)}
                                            onRefreshAction={refreshInvestments}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                    
                    {investments.length === 0 && (
                        <div className="text-center py-24 bg-surface/40 rounded-[2.5rem] border-2 border-dashed border-surface-border/50">
                            <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <ChartBarSquareIcon className="w-8 h-8 text-text-muted" />
                            </div>
                            <p className="text-text-muted font-bold">No investments found</p>
                            <p className="text-xs text-text-muted mt-1">Add your first investment to start tracking your growth.</p>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <AddInvestmentForm />
                </div>
            </div>

            {editingInvestment && (
                <EditInvestmentModal
                    investment={editingInvestment}
                    onCloseAction={() => setEditingInvestment(null)}
                    onInvestmentUpdatedAction={() => {
                        setEditingInvestment(null);
                    }}
                />
            )}
        </div>
    );
}

