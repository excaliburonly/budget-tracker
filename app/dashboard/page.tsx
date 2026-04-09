import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { getTransactions } from "./transactions/actions";
import { Transaction } from "@/types/database";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  
  const transactions = await getTransactions();
  
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);
    
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);
    
  const balance = income - expenses;

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.email}</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Balance</span>
          <div className={`text-3xl font-bold mt-1 ${balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600'}`}>
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-gray-500 mt-2 inline-block">Net position</span>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Income</span>
          <div className="text-3xl font-bold text-emerald-600 mt-1">
            ${income.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-gray-500 mt-2 inline-block">Total earnings</span>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Expenses</span>
          <div className="text-3xl font-bold text-red-600 mt-1">
            ${expenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-gray-500 mt-2 inline-block">Total spending</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
            <Link href="/dashboard/transactions" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              View All
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden min-h-64">
            {transactions.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-sm text-gray-400">No recent transactions to display.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {transactions.slice(0, 5).map((t: Transaction) => (
                  <li key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{t.notes || t.categories?.name || 'Uncategorized'}</span>
                      <span className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()}</span>
                    </div>
                    <span className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Budget Status Placeholder */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Budget Status</h3>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 h-64 flex items-center justify-center shadow-sm">
            <p className="text-sm text-gray-400 text-center px-6">Start by setting your first budget in the Budgets tab.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
