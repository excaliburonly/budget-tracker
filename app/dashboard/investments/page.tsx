"use client";

import { AddInvestmentForm, EditInvestmentModal } from "@/components/forms/InvestmentForms";
import { InvestmentCard } from "@/components/dashboard/InvestmentCard";
import { Investment } from "@/types/database";
import { useState, useMemo } from "react";
import { ChartBarSquareIcon } from "@heroicons/react/24/outline";
import { useDashboard } from "@/providers/dashboard-provider";
import { formatCurrency } from "@/utils/format";
import Link from "next/link";

export default function InvestmentsPage() {
    const { 
        investments, 
        currency, 
        loading, 
        refreshInvestments 
    } = useDashboard();
    
    const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);

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
        return <div className="p-8 text-center text-text-muted">Loading investments...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ChartBarSquareIcon className="w-8 h-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Investment Portfolio</h1>
                        <p className="text-text-muted mt-1">Summary of all your assets</p>
                    </div>
                </div>
                <div className="bg-surface p-4 rounded-2xl border border-input-border text-right">
                    <p className="text-sm text-text-muted mb-1">Total Portfolio Value</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(totalPortfolioValue, currency)}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-12">
                    {Object.entries(investmentsByType).map(([type, typeInvestments]) => (
                        <section key={type} className="space-y-4">
                            <div className="flex items-center justify-between border-b border-surface-border pb-2">
                                <h2 className="text-xl font-bold text-foreground">{type}</h2>
                                <Link 
                                    href={`/dashboard/investments/${type.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="text-sm font-medium text-primary hover:underline"
                                >
                                    View Detailed {type} →
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {typeInvestments.map((investment) => (
                                    <InvestmentCard
                                        key={investment.id}
                                        investment={investment}
                                        currency={currency}
                                        onEditAction={() => setEditingInvestment(investment)}
                                        onRefreshAction={refreshInvestments}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}
                    
                    {investments.length === 0 && (
                        <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-input-border">
                            <p className="text-text-muted">No investments added yet.</p>
                        </div>
                    )}
                </div>

                <div>
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
