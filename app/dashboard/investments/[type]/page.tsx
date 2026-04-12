"use client";

import { AddInvestmentForm, EditInvestmentModal } from "@/components/forms/InvestmentForms";
import { InvestmentCard } from "@/components/dashboard/InvestmentCard";
import { Investment } from "@/types/database";
import { useState, useMemo } from "react";
import { ChartBarSquareIcon } from "@heroicons/react/24/outline";
import { useDashboard } from "@/providers/dashboard-provider";
import { useParams } from "next/navigation";
import { formatCurrency } from "@/utils/format";

export default function InvestmentTypePage() {
    const params = useParams();
    const type = params.type as string;
    
    const { 
        investments, 
        currency, 
        loading, 
        refreshInvestments 
    } = useDashboard();
    
    const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);

    const filteredInvestments = useMemo(() => {
        return investments.filter(inv => 
            inv.investment_type.toLowerCase().replace(/\s+/g, '-') === type
        );
    }, [investments, type]);

    const totalValue = useMemo(() => {
        return filteredInvestments.reduce((sum, inv) => sum + (inv.current_value * inv.quantity), 0);
    }, [filteredInvestments]);

    const typeDisplayName = useMemo(() => {
        if (filteredInvestments.length > 0) {
            return filteredInvestments[0].investment_type;
        }
        return type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' ');
    }, [filteredInvestments, type]);

    if (loading) {
        return <div className="p-8 text-center text-text-muted">Loading {typeDisplayName}...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ChartBarSquareIcon className="w-8 h-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">{typeDisplayName}</h1>
                        <p className="text-text-muted mt-1">Manage your {typeDisplayName.toLowerCase()} portfolio</p>
                    </div>
                </div>
                <div className="bg-surface p-4 rounded-2xl border border-input-border text-right">
                    <p className="text-sm text-text-muted mb-1">Total {typeDisplayName} Value</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(totalValue, currency)}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredInvestments.map((investment) => (
                            <InvestmentCard
                                key={investment.id}
                                investment={investment}
                                currency={currency}
                                onEditAction={() => setEditingInvestment(investment)}
                                onRefreshAction={refreshInvestments}
                            />
                        ))}
                    </div>
                    {filteredInvestments.length === 0 && (
                        <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-input-border">
                            <p className="text-text-muted">No {typeDisplayName.toLowerCase()} added yet.</p>
                        </div>
                    )}
                </div>

                <div>
                    <AddInvestmentForm initialType={typeDisplayName} />
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
