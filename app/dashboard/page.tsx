import {createClient} from "@/utils/supabase/server";
import {cookies} from "next/headers";
import Link from "next/link";
import { getTransactions } from "@/actions/transactions";
import { getBudgets } from "@/actions/budgets";
import { getAccounts } from "@/actions/accounts";
import {Budget, Transaction} from "@/types/database";
import {formatCurrency} from "@/utils/format";
import {
    ArrowTrendingDownIcon,
    ArrowTrendingUpIcon,
    BanknotesIcon,
    ChartPieIcon,
    ChevronRightIcon,
    ClockIcon,
    CreditCardIcon
} from "@heroicons/react/24/outline";

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {data: {user}} = await supabase.auth.getUser();

    // Get user profile for currency
    const {data: profile} = await supabase
        .from('profiles')
        .select('currency')
        .eq('id', user?.id)
        .single();

    const currency = profile?.currency || 'INR';

    const currentMonth = new Date().toISOString().slice(0, 7);
    const [transactions, budgets, accounts] = await Promise.all([getTransactions(), getBudgets(currentMonth), getAccounts()]);

    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + Number(t.amount), 0);

    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + Number(t.amount), 0);

    const totalBalance = accounts.reduce((acc, a) => acc + Number(a.balance), 0);

    // Budget calculations
    const spendingByCategory = transactions
        .filter(t => t.date.startsWith(currentMonth) && t.type === 'expense')
        .reduce((acc: Record<string, number>, t: Transaction) => {
            if (t.category_id) {
                acc[t.category_id] = (acc[t.category_id] || 0) + Number(t.amount);
            }
            return acc;
        }, {});

    return (<div className="max-w-6xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
                <p className="text-text-muted mt-1">Welcome back, {user?.email}</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div
                    className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-background rounded-lg">
                            <BanknotesIcon className="w-5 h-5 text-text-muted"/>
                        </div>
                        <span className="text-sm font-medium text-text-muted uppercase tracking-wider">Total Balance</span>
                    </div>
                    <div
                        className={`text-3xl font-bold mt-2 ${totalBalance >= 0 ? 'text-foreground' : 'text-red-600'}`}>
                        {formatCurrency(totalBalance, currency)}
                    </div>
                    <span className="text-xs text-text-muted mt-2 inline-block">Sum of all accounts</span>
                </div>

                <div
                    className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-600"/>
                        </div>
                        <span className="text-sm font-medium text-text-muted uppercase tracking-wider">Monthly Income</span>
                    </div>
                    <div className="text-3xl font-bold text-emerald-600 mt-2">
                        {formatCurrency(income, currency)}
                    </div>
                    <span className="text-xs text-text-muted mt-2 inline-block">Total earnings</span>
                </div>

                <div
                    className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <ArrowTrendingDownIcon className="w-5 h-5 text-red-600"/>
                        </div>
                        <span className="text-sm font-medium text-text-muted uppercase tracking-wider">Monthly Expenses</span>
                    </div>
                    <div className="text-3xl font-bold text-red-600 mt-2">
                        {formatCurrency(expenses, currency)}
                    </div>
                    <span className="text-xs text-text-muted mt-2 inline-block">Total spending</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Accounts Overview */}
                <section className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <CreditCardIcon className="w-6 h-6 text-foreground"/>
                            <h3 className="text-xl font-bold text-foreground">Your Accounts</h3>
                        </div>
                        <Link href="/dashboard/accounts"
                              className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors bg-link-hover-bg px-3 py-1.5 rounded-full flex items-center gap-1">
                            Manage
                            <ChevronRightIcon className="w-4 h-4"/>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {accounts.slice(0, 4).map((account) => (<div key={account.id}
                                                                     className="bg-surface p-4 rounded-xl border border-surface-border shadow-sm">
                                <span
                                    className="text-[10px] font-bold text-primary uppercase tracking-widest">{account.type}</span>
                                <h4 className="text-sm font-bold text-foreground truncate">{account.name}</h4>
                                <div className="text-lg font-black text-foreground mt-1">
                                    {formatCurrency(account.balance, currency)}
                                </div>
                            </div>))}
                        {accounts.length === 0 && (<div
                                className="col-span-full py-4 text-center text-sm text-text-muted border border-dashed border-surface-border rounded-xl">
                                No accounts added yet.
                            </div>)}
                    </div>
                </section>

                {/* Recent Activity */}
                <section className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <ClockIcon className="w-6 h-6 text-foreground"/>
                            <h3 className="text-xl font-bold text-foreground">Recent Transactions</h3>
                        </div>
                        <Link href="/dashboard/transactions"
                              className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors bg-link-hover-bg px-3 py-1.5 rounded-full flex items-center gap-1">
                            View All
                            <ChevronRightIcon className="w-4 h-4"/>
                        </Link>
                    </div>
                    <div
                        className="bg-surface rounded-2xl border border-surface-border shadow-sm overflow-hidden min-h-64">
                        {transactions.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center space-y-3">
                                <div
                                    className="w-12 h-12 bg-background rounded-full flex items-center justify-center">
                                    <ClockIcon className="w-6 h-6 text-text-muted"/>
                                </div>
                                <p className="text-sm text-text-muted">No recent transactions to display.</p>
                            </div>) : (<ul className="divide-y divide-surface-border">
                                {transactions.slice(0, 6).map((t: Transaction) => (<li key={t.id}
                                                                                       className="p-4 flex items-center justify-between hover:bg-background/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                                style={{backgroundColor: t.categories?.color || '#3b82f6'}}
                                            >
                                                {t.categories?.name?.charAt(0) || 'T'}
                                            </div>
                                            <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground leading-tight">
                          {t.notes || t.categories?.name || 'Uncategorized'}
                        </span>
                                                <span
                                                    className="text-xs text-text-muted font-medium">{new Date(t.date).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}</span>
                                            </div>
                                        </div>
                                        <span
                                            className={`text-sm font-extrabold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(Number(t.amount), currency)}
                    </span>
                                    </li>))}
                            </ul>)}
                    </div>
                </section>

                {/* Budget Status */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <ChartPieIcon className="w-6 h-6 text-foreground"/>
                            <h3 className="text-xl font-bold text-foreground">Budget Overview</h3>
                        </div>
                        <Link href="/dashboard/budgets"
                              className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors bg-link-hover-bg px-3 py-1.5 rounded-full flex items-center gap-1">
                            Edit
                            <ChevronRightIcon className="w-4 h-4"/>
                        </Link>
                    </div>
                    <div
                        className="bg-surface rounded-2xl border border-surface-border shadow-sm p-6 min-h-64">
                        {budgets.length === 0 ? (<div
                                className="h-full flex flex-col items-center justify-center text-center space-y-4 pt-10">
                                <p className="text-sm text-text-muted">Track your spending by setting your first monthly
                                    budget.</p>
                                <Link href="/dashboard/budgets"
                                      className="text-sm font-bold text-primary hover:underline">
                                    Set a Budget &rarr;
                                </Link>
                            </div>) : (<div className="space-y-6">
                                {budgets.slice(0, 3).map((budget: Budget) => {
                                    const spent = spendingByCategory[budget.category_id] || 0;
                                    const percentage = Math.min((spent / budget.amount) * 100, 100);
                                    const isOver = spent > budget.amount;

                                    return (<div key={budget.id} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span
                                                    className="text-sm font-bold text-foreground/80">{budget.categories?.name}</span>
                                                <span className="text-xs font-medium text-text-muted">
                          {formatCurrency(spent, currency)} / {formatCurrency(Number(budget.amount), currency)}
                        </span>
                                            </div>
                                            <div
                                                className="w-full bg-background rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-700 ease-out ${isOver ? 'bg-red-500' : percentage > 90 ? 'bg-amber-500' : 'bg-primary'}`}
                                                    style={{width: `${percentage}%`}}
                                                />
                                            </div>
                                        </div>);
                                })}
                                {budgets.length > 3 && (<p className="text-xs text-center text-text-muted font-medium">
                                        + {budgets.length - 3} more budgets
                                    </p>)}
                            </div>)}
                    </div>
                </section>
            </div>
        </div>);

}
