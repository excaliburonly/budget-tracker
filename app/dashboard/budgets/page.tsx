"use client";

import {deleteBudget, getBudgets} from "./actions";
import {getCategories, getTransactions} from "../transactions/actions";
import BudgetForm, {EditBudgetModal} from "./BudgetForm";
import {Budget, Category, Transaction} from "@/types/database";
import {formatCurrency} from "@/utils/format";
import {createClient} from "@/utils/supabase/client";
import {useEffect, useState, useCallback} from "react";

import {ChartPieIcon, PencilSquareIcon, TrashIcon} from "@heroicons/react/24/outline";

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
        const {data: {user}} = await supabase.auth.getUser();

        const {data: profile} = await supabase
            .from('profiles')
            .select('currency')
            .eq('id', user?.id)
            .single();

        setCurrency(profile?.currency || 'INR');

        const [budgetsData, categoriesData, transactionsData] = await Promise.all([getBudgets(currentMonth), getCategories(), getTransactions()]);

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
        return <div className="p-8 text-center text-gray-500">Loading budgets...</div>;
    }

    return (<div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <header className="mb-10 flex items-center gap-3">
                <ChartPieIcon className="w-8 h-8 text-blue-600"/>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Monthly Budgets</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your spending limits
                        for {new Intl.DateTimeFormat('en-US', {month: 'long', year: 'numeric'}).format(new Date())}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Budgets</h3>
                    </div>

                    {budgets.length === 0 ? (<div
                            className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 h-48 flex flex-col items-center justify-center p-6 text-center">
                            <p className="text-gray-500 dark:text-gray-400">No budgets set for this month yet.</p>
                            <p className="text-sm text-gray-400 mt-1">Add your first budget limit using the form.</p>
                        </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {budgets.map((budget: Budget) => {
                                const spent = spendingByCategory[budget.category_id] || 0;
                                const percentage = Math.min((spent / budget.amount) * 100, 100);
                                const isOver = spent > budget.amount;

                                return (<div key={budget.id}
                                             className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm relative group overflow-hidden">
                                        {isOver && (<div
                                                className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold uppercase tracking-wider">
                                                Over Budget
                                            </div>)}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                                    style={{backgroundColor: budget.categories?.color || '#3b82f6'}}
                                                >
                                                    {budget.categories?.name?.charAt(0) || 'B'}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">{budget.categories?.name}</h4>
                                                    <span className="text-xs text-gray-500">{budget.month}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setEditingBudget(budget)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Edit Budget"
                                                >
                                                    <PencilSquareIcon className="w-4 h-4"/>
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Delete this budget limit?')) {
                                                            await deleteBudget(budget.id);
                                                            refreshData();
                                                        }
                                                    }}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                                    title="Delete Budget"
                                                >
                                                    <TrashIcon className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span
                                                    className="text-gray-500">Spent: {formatCurrency(spent, currency)}</span>
                                                <span
                                                    className="text-gray-900 dark:text-white font-medium">Limit: {formatCurrency(Number(budget.amount), currency)}</span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div
                                                className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ease-out ${isOver ? 'bg-red-500' : percentage > 85 ? 'bg-amber-500' : 'bg-blue-500'}`}
                                                    style={{width: `${percentage}%`}}
                                                />
                                            </div>

                                            <div className="flex justify-between items-center pt-2">
                        <span className="text-xs font-medium text-gray-400">
                          {Math.round(percentage)}% of limit used
                        </span>
                                                {isOver && (<span className="text-xs font-bold text-red-500">
                            +{formatCurrency(spent - budget.amount, currency)} over
                          </span>)}
                                            </div>
                                        </div>
                                    </div>);
                            })}
                        </div>)}
                </div>

                <div>
                    <BudgetForm categories={categories}/>
                </div>
            </div>

            {editingBudget && (<EditBudgetModal
                    budget={editingBudget}
                    categories={categories}
                    onCloseAction={() => {
                        setEditingBudget(null);
                        refreshData();
                    }}
                />)}
        </div>);
}

