import { getBudgets } from "./actions";
import { getCategories, getTransactions } from "../transactions/actions";
import BudgetForm from "./BudgetForm";
import { Budget, Transaction } from "@/types/database";
import { formatCurrency } from "@/utils/format";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function BudgetsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('currency')
    .eq('id', user?.id)
    .single();

  const currency = profile?.currency || 'INR';

  const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-04"
  const budgets = await getBudgets(currentMonth);
  const categories = await getCategories();
  const transactions = await getTransactions();

  // Filter transactions for current month and expenses
  const currentMonthTransactions = transactions.filter(t => 
    t.date.startsWith(currentMonth) && t.type === 'expense'
  );

  // Group transaction amounts by category_id
  const spendingByCategory = currentMonthTransactions.reduce((acc: Record<string, number>, t: Transaction) => {
    if (t.category_id) {
      acc[t.category_id] = (acc[t.category_id] || 0) + Number(t.amount);
    }
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Monthly Budgets</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your spending limits for {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date())}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Budgets</h3>
          </div>
          
          {budgets.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 h-48 flex flex-col items-center justify-center p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">No budgets set for this month yet.</p>
              <p className="text-sm text-gray-400 mt-1">Add your first budget limit using the form.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {budgets.map((budget: any) => {
                const spent = spendingByCategory[budget.category_id] || 0;
                const percentage = Math.min((spent / budget.amount) * 100, 100);
                const isOver = spent > budget.amount;

                return (
                  <div key={budget.id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm relative group overflow-hidden">
                    {isOver && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold uppercase tracking-wider">
                        Over Budget
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: budget.categories?.color || '#3b82f6' }}
                        >
                          {budget.categories?.name?.charAt(0) || 'B'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{budget.categories?.name}</h4>
                          <span className="text-xs text-gray-500">{budget.month}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Spent: {formatCurrency(spent, currency)}</span>
                        <span className="text-gray-900 dark:text-white font-medium">Limit: {formatCurrency(Number(budget.amount), currency)}</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ease-out ${
                            isOver ? 'bg-red-500' : percentage > 85 ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs font-medium text-gray-400">
                          {Math.round(percentage)}% of limit used
                        </span>
                        {isOver && (
                          <span className="text-xs font-bold text-red-500">
                            +{formatCurrency(spent - budget.amount, currency)} over
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <BudgetForm categories={categories} />
        </div>
      </div>
    </div>
  );
}
