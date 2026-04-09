import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { getTransactions } from "./transactions/actions";
import { getBudgets } from "./budgets/actions";
import { Transaction } from "@/types/database";
import { formatCurrency } from "@/utils/format";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get user profile for currency
  const { data: profile } = await supabase
    .from('profiles')
    .select('currency')
    .eq('id', user?.id)
    .single();

  const currency = profile?.currency || 'INR';
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const transactions = await getTransactions();
  const budgets = await getBudgets(currentMonth);
  
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);
    
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);
    
  const balance = income - expenses;

  // Budget calculations
  const spendingByCategory = transactions
    .filter(t => t.date.startsWith(currentMonth) && t.type === 'expense')
    .reduce((acc: Record<string, number>, t: Transaction) => {
      if (t.category_id) {
        acc[t.category_id] = (acc[t.category_id] || 0) + Number(t.amount);
      }
      return acc;
    }, {});

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.email}</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Balance</span>
          <div className={`text-3xl font-bold mt-2 ${balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600'}`}>
            {formatCurrency(balance, currency)}
          </div>
          <span className="text-xs text-gray-400 mt-2 inline-block">Net position</span>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monthly Income</span>
          <div className="text-3xl font-bold text-emerald-600 mt-2">
            {formatCurrency(income, currency)}
          </div>
          <span className="text-xs text-gray-400 mt-2 inline-block">Total earnings</span>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monthly Expenses</span>
          <div className="text-3xl font-bold text-red-600 mt-2">
            {formatCurrency(expenses, currency)}
          </div>
          <span className="text-xs text-gray-400 mt-2 inline-block">Total spending</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Transactions</h3>
            <Link href="/dashboard/transactions" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full">
              View All
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden min-h-64">
            {transactions.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-gray-300">!</span>
                </div>
                <p className="text-sm text-gray-400">No recent transactions to display.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {transactions.slice(0, 6).map((t: Transaction) => (
                  <li key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: t.categories?.color || '#3b82f6' }}
                      >
                        {t.categories?.name?.charAt(0) || 'T'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                          {t.notes || t.categories?.name || 'Uncategorized'}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">{new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                    <span className={`text-sm font-extrabold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(Number(t.amount), currency)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Budget Status */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Budget Overview</h3>
            <Link href="/dashboard/budgets" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full">
              Edit
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 min-h-64">
            {budgets.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 pt-10">
                <p className="text-sm text-gray-400">Track your spending by setting your first monthly budget.</p>
                <Link href="/dashboard/budgets" className="text-sm font-bold text-blue-600 hover:underline">
                  Set a Budget &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {budgets.slice(0, 3).map((budget: any) => {
                  const spent = spendingByCategory[budget.category_id] || 0;
                  const percentage = Math.min((spent / budget.amount) * 100, 100);
                  const isOver = spent > budget.amount;
                  
                  return (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{budget.categories?.name}</span>
                        <span className="text-xs font-medium text-gray-500">
                          {formatCurrency(spent, currency)} / {formatCurrency(Number(budget.amount), currency)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-700 ease-out ${
                            isOver ? 'bg-red-500' : percentage > 90 ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {budgets.length > 3 && (
                  <p className="text-xs text-center text-gray-400 font-medium">
                    + {budgets.length - 3} more budgets
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
