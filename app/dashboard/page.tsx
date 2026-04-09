import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

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
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">$12,450.00</div>
          <span className="text-xs text-emerald-600 font-medium mt-2 inline-block">+2.4% from last month</span>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Income</span>
          <div className="text-3xl font-bold text-emerald-600 mt-1">$5,200.00</div>
          <span className="text-xs text-gray-500 mt-2 inline-block">Next expected: Apr 30</span>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Expenses</span>
          <div className="text-3xl font-bold text-red-600 mt-1">$2,150.00</div>
          <span className="text-xs text-gray-500 mt-2 inline-block">42% of budget used</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">View All</button>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 h-64 flex items-center justify-center shadow-sm">
            <p className="text-sm text-gray-400">No recent transactions to display.</p>
          </div>
        </section>

        {/* Budget Status */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Budget Status</h3>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 h-64 flex items-center justify-center shadow-sm">
            <p className="text-sm text-gray-400 text-center px-6">Start by setting your first budget.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
