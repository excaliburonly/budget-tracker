import Link from "next/link";
import { signOut } from "@/app/auth/actions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <h2 className="text-2xl font-extrabold text-blue-600 tracking-tight">Ledgr</h2>
        </div>
        
        <nav className="flex-1 px-4 flex flex-col gap-1">
          <Link href="/dashboard" className="px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors font-medium text-sm">
            Dashboard
          </Link>
          <Link href="/dashboard/transactions" className="px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors font-medium text-sm">
            Transactions
          </Link>
          <Link href="/dashboard/budgets" className="px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors font-medium text-sm">
            Budgets
          </Link>
          <Link href="/dashboard/investments" className="px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors font-medium text-sm">
            Investments
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <form action={signOut}>
            <button className="w-full px-4 py-2 text-left text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
