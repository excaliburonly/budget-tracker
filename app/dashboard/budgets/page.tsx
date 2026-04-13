"use client";

import { AddBudgetForm, EditBudgetModal } from "@/components/forms/BudgetForms";
import { BudgetCard } from "@/components/dashboard/BudgetCard";
import { Budget, Transaction } from "@/types/database";
import { useState } from "react";
import { ChartPieIcon } from "@heroicons/react/24/outline";
import { useDashboard } from "@/providers/dashboard-provider";
import BudgetProgressChart from "@/components/charts/BudgetProgressChart";

export default function BudgetsPage() {
    const { 
        budgets, 
        transactions, 
        currency, 
        loading, 
        refreshBudgets 
    } = useDashboard();
    
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

    const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-04"

    // Filter transactions for current month and expenses
    const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth) && t.type === 'expense');

    // Group transaction amounts by category_id
    const spendingByCategory = currentMonthTransactions.reduce((acc: Record<string, number>, t: Transaction) => {
        if (t.category_id) {
            acc[t.category_id] = (acc[t.category_id] || 0) + Number(t.amount);
        }
        return acc;
    }, {});

    // Prepare data for BudgetProgressChart
    const budgetChartData = budgets.map(b => ({
        name: b.categories?.name || 'Unknown',
        spent: spendingByCategory[b.category_id] || 0,
        amount: Number(b.amount)
    }));

    if (loading) {
        return <div className="p-8 text-center text-text-muted">Loading budgets...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-10 flex items-center gap-3">
                <ChartPieIcon className="w-8 h-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Monthly Budgets</h1>
                    <p className="text-text-muted mt-1">
                        Manage your spending limits for {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date())}
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Overall Budget Progress Chart */}
                    {budgets.length > 0 && (
                        <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm">
                            <h3 className="text-lg font-semibold text-foreground mb-6">Budget vs Reality</h3>
                            <BudgetProgressChart data={budgetChartData} currency={currency} />
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-foreground">Active Budgets</h3>
                        </div>

                        {budgets.length === 0 ? (
                            <div className="bg-surface rounded-2xl border border-dashed border-input-border h-48 flex flex-col items-center justify-center p-6 text-center">
                                <p className="text-text-muted">No budgets set for this month yet.</p>
                                <p className="text-sm text-text-muted/60 mt-1">Add your first budget limit using the form.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {budgets.map((budget: Budget) => (
                                    <BudgetCard
                                        key={budget.id}
                                        budget={budget}
                                        spent={spendingByCategory[budget.category_id] || 0}
                                        currency={currency}
                                        onEditAction={setEditingBudget}
                                        onRefreshAction={refreshBudgets}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <AddBudgetForm />
                </div>
            </div>

            {editingBudget && (
                <EditBudgetModal
                    budget={editingBudget}
                    onCloseAction={() => setEditingBudget(null)}
                    onBudgetUpdatedAction={() => {
                        setEditingBudget(null);
                    }}
                />
            )}
        </div>
    );
}
