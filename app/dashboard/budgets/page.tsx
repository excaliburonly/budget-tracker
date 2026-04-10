"use client";

import { getBudgets } from "@/actions/budgets";
import { getCategories, getTransactions } from "@/actions/transactions";
import { AddBudgetForm, EditBudgetModal } from "@/components/forms/BudgetForms";
import { BudgetCard } from "@/components/dashboard/BudgetCard";
import { Budget, Category, Transaction } from "@/types/database";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, useCallback } from "react";

import { ChartPieIcon } from "@heroicons/react/24/outline";

export default function BudgetsPage() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [currency, setCurrency] = useState('INR');
    const [loading, setLoading] = useState(true);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

    const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-04"

    const fetchData = useCallback(async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const { data: profile } = await supabase
            .from('profiles')
            .select('currency')
            .eq('id', user?.id)
            .single();

        setCurrency(profile?.currency || 'INR');

        const [budgetsData, categoriesData, transactionsData] = await Promise.all([
            getBudgets(currentMonth), 
            getCategories(), 
            getTransactions()
        ]);

        setBudgets(budgetsData);
        setCategories(categoriesData);
        setTransactions(transactionsData);
        setLoading(false);
    }, [currentMonth]);

    useEffect(() => {
        const init = async () => {
            await fetchData();
        };
        init();
    }, [fetchData]);

    const refreshData = () => {
        fetchData();
    };

    // Filter transactions for current month and expenses
    const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth) && t.type === 'expense');

    // Group transaction amounts by category_id
    const spendingByCategory = currentMonthTransactions.reduce((acc: Record<string, number>, t: Transaction) => {
        if (t.category_id) {
            acc[t.category_id] = (acc[t.category_id] || 0) + Number(t.amount);
        }
        return acc;
    }, {});

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
                <div className="lg:col-span-2 space-y-6">
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
                                    onEdit={setEditingBudget}
                                    onRefresh={refreshData}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <AddBudgetForm categories={categories} onBudgetAdded={refreshData} />
                </div>
            </div>

            {editingBudget && (
                <EditBudgetModal
                    budget={editingBudget}
                    categories={categories}
                    onCloseAction={() => {
                        setEditingBudget(null);
                        refreshData();
                    }}
                />
            )}
        </div>
    );
}
