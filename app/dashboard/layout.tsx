import Link from "next/link";
import { signOut } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { 
  HomeIcon, 
  BanknotesIcon, 
  ArrowsRightLeftIcon, 
  ChartBarIcon, 
  ChartPieIcon, 
  ShieldCheckIcon,
  ArrowRightStartOnRectangleIcon
} from "@heroicons/react/24/outline";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col sticky top-0 h-screen">
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <ChartBarIcon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">Ledgr</h2>
        </div>
        
        <nav className="flex-1 px-4 flex flex-col gap-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/80 hover:bg-link-hover-bg hover:text-link-hover-text transition-colors font-medium text-sm">
            <HomeIcon className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="/dashboard/accounts" className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/80 hover:bg-link-hover-bg hover:text-link-hover-text transition-colors font-medium text-sm">
            <BanknotesIcon className="w-5 h-5" />
            Accounts
          </Link>
          <Link href="/dashboard/transactions" className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/80 hover:bg-link-hover-bg hover:text-link-hover-text transition-colors font-medium text-sm">
            <ArrowsRightLeftIcon className="w-5 h-5" />
            Transactions
          </Link>
          <Link href="/dashboard/budgets" className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/80 hover:bg-link-hover-bg hover:text-link-hover-text transition-colors font-medium text-sm">
            <ChartPieIcon className="w-5 h-5" />
            Budgets
          </Link>
          <Link href="/dashboard/investments" className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/80 hover:bg-link-hover-bg hover:text-link-hover-text transition-colors font-medium text-sm">
            <ChartBarIcon className="w-5 h-5" />
            Investments
          </Link>
          <Link href="/dashboard/emergency-funds" className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/80 hover:bg-link-hover-bg hover:text-link-hover-text transition-colors font-medium text-sm">
            <ShieldCheckIcon className="w-5 h-5" />
            Emergency Funds
          </Link>
        </nav>

        <div className="p-4 border-t border-sidebar-border flex flex-col gap-2">
          <ThemeToggle align="top" />
          <form action={signOut}>
            <button className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm font-medium text-text-muted hover:text-red-600 hover:bg-red-50/10 rounded-lg transition-colors">
              <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
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
