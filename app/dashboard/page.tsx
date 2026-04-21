import {createClient} from "@/utils/supabase/server";
import {cookies} from "next/headers";
import Link from "next/link";
import {getTransactions} from "@/actions/transactions";
import {getBudgets} from "@/actions/budgets";
import {getAccounts} from "@/actions/accounts";
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
import IncomeExpenseChart from "@/components/charts/IncomeExpenseChart";
import AccountsPieChart from "@/components/charts/AccountsPieChart";
import CategoryBreakdownChart from "@/components/charts/CategoryBreakdownChart";

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
        .filter(t => t.type === 'income' && t.date.startsWith(currentMonth))
        .reduce((acc, t) => acc + Number(t.amount), 0);

    const expenses = transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
        .reduce((acc, t) => acc + Number(t.amount), 0);

    const totalBalance = accounts.reduce((acc, a) => acc + Number(a.balance), 0);

    // Calculate money left per day
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const currentDay = today.getDate();
    const daysLeft = Math.max(1, lastDayOfMonth - currentDay);
    const moneyPerDay = totalBalance / daysLeft;

    // Budget calculations
    const spendingByCategory = transactions
        .filter(t => t.date.startsWith(currentMonth) && t.type === 'expense')
        .reduce((acc: Record<string, number>, t: Transaction) => {
            if (t.category_id) {
                acc[t.category_id] = (acc[t.category_id] || 0) + Number(t.amount);
            }
            return acc;
        }, {});

    // Prepare data for IncomeExpenseChart (last 6 months)
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push(d.toISOString().slice(0, 7));
    }

    const incomeExpenseData = months.map(m => {
        const monthIncome = transactions
            .filter(t => t.date.startsWith(m) && t.type === 'income')
            .reduce((acc, t) => acc + Number(t.amount), 0);
        const monthExpense = transactions
            .filter(t => t.date.startsWith(m) && t.type === 'expense')
            .reduce((acc, t) => acc + Number(t.amount), 0);

        return {
            name: new Date(m + "-01").toLocaleDateString(undefined, {month: 'short'}),
            income: monthIncome,
            expense: monthExpense
        };
    });

    // Prepare data for AccountsPieChart
    const accountData = accounts.map(a => ({
        name: a.name, value: Number(a.balance)
    }));

    // Prepare data for CategoryBreakdownChart (spending by category)
    const expenseByCategoryData = Object.values(transactions
        .filter(t => t.date.startsWith(currentMonth) && t.type === 'expense')
        .reduce((acc: Record<string, { name: string; value: number; color: string }>, t: Transaction) => {
            const catName = t.categories?.name || 'Uncategorized';
            const catId = t.category_id || 'uncategorized';
            if (!acc[catId]) {
                acc[catId] = {
                    name: catName, value: 0, color: t.categories?.color || 'var(--error)'
                };
            }
            acc[catId].value += Number(t.amount);
            return acc;
        }, {}));

    // Prepare data for CategoryBreakdownChart (income by category)
    const incomeByCategoryData = Object.values(transactions
        .filter(t => t.date.startsWith(currentMonth) && t.type === 'income')
        .reduce((acc: Record<string, { name: string; value: number; color: string }>, t: Transaction) => {
            const catName = t.categories?.name || 'Uncategorized';
            const catId = t.category_id || 'uncategorized';
            if (!acc[catId]) {
                acc[catId] = {
                    name: catName, value: 0, color: t.categories?.color || 'var(--success)'
                };
            }
            acc[catId].value += Number(t.amount);
            return acc;
        }, {}));

    return (<div className="max-w-7xl mx-auto space-y-10 animate-fade-in-up">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Dashboard Overview</h1>
                <p className="text-text-muted mt-2 text-sm md:text-base font-medium">
                    Welcome back, <span className="text-primary">{user?.email}</span>
                </p>
            </div>
            <div className="hidden md:block">
                <span className="text-xs font-bold text-text-muted uppercase tracking-widest bg-surface px-3 py-1.5 rounded-full border border-surface-border">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
            </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
                className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors">
                        <BanknotesIcon className="w-6 h-6 text-primary"/>
                    </div>
                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Total Balance</span>
                </div>
                <div
                    className={`text-3xl font-black tracking-tight ${totalBalance >= 0 ? 'text-foreground' : 'text-red-500'}`}>
                    {formatCurrency(totalBalance, currency)}
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-[10px] font-bold text-text-muted uppercase tracking-wider bg-background/50 w-fit px-2 py-1 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Sum of all accounts
                </div>
            </div>

            <div
                className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-amber-500/10 rounded-2xl group-hover:bg-amber-500/20 transition-colors">
                        <ClockIcon className="w-6 h-6 text-amber-600"/>
                    </div>
                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Daily Budget</span>
                </div>
                <div
                    className={`text-3xl font-black tracking-tight ${moneyPerDay >= 0 ? 'text-primary' : 'text-red-500'}`}>
                    {formatCurrency(moneyPerDay, currency)}
                </div>
                <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-amber-500 transition-all duration-1000" 
                            style={{ width: `${Math.max(10, (daysLeft / lastDayOfMonth) * 100)}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{daysLeft} days left</span>
                </div>
            </div>

            <div
                className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 transition-colors">
                        <ArrowTrendingUpIcon className="w-6 h-6 text-emerald-600"/>
                    </div>
                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Monthly Income</span>
                </div>
                <div className="text-3xl font-black tracking-tight text-emerald-600">
                    {formatCurrency(income, currency)}
                </div>
                <span className="text-[10px] font-bold text-text-muted mt-3 inline-block uppercase tracking-wider">Earned this month</span>
            </div>

            <div
                className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-red-500/10 rounded-2xl group-hover:bg-red-500/20 transition-colors">
                        <ArrowTrendingDownIcon className="w-6 h-6 text-red-600"/>
                    </div>
                    <span
                        className="text-xs font-bold text-text-muted uppercase tracking-widest">Monthly Expenses</span>
                </div>
                <div className="text-3xl font-black tracking-tight text-red-600">
                    {formatCurrency(expenses, currency)}
                </div>
                <span className="text-[10px] font-bold text-text-muted mt-3 inline-block uppercase tracking-wider">Spent this month</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Visual Insights */}
            <section className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <ArrowTrendingUpIcon className="w-6 h-6 text-primary"/>
                    </div>
                    <h3 className="text-xl font-black text-foreground tracking-tight">Income vs Expenses</h3>
                </div>
                <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm">
                    <IncomeExpenseChart data={incomeExpenseData} currency={currency}/>
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <CreditCardIcon className="w-6 h-6 text-primary"/>
                    </div>
                    <h3 className="text-xl font-black text-foreground tracking-tight">Asset Distribution</h3>
                </div>
                <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm">
                    <AccountsPieChart data={accountData} currency={currency}/>
                </div>
            </section>

            {/* Category Breakdown */}
            <section className="lg:col-span-3 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/10 rounded-xl">
                                <ChartPieIcon className="w-6 h-6 text-red-600"/>
                            </div>
                            <h3 className="text-xl font-black text-foreground tracking-tight">Spending by Category</h3>
                        </div>
                        <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm">
                            <CategoryBreakdownChart data={expenseByCategoryData} currency={currency} title="Expenses"/>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-xl">
                                <ChartPieIcon className="w-6 h-6 text-emerald-600"/>
                            </div>
                            <h3 className="text-xl font-black text-foreground tracking-tight">Income by Category</h3>
                        </div>
                        <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm">
                            <CategoryBreakdownChart data={incomeByCategoryData} currency={currency} title="Income"/>
                        </div>
                    </div>
                </div>
            </section>

            {/* Accounts Overview */}
            <section className="lg:col-span-3 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <CreditCardIcon className="w-6 h-6 text-primary"/>
                        </div>
                        <h3 className="text-xl font-black text-foreground tracking-tight">Your Accounts</h3>
                    </div>
                    <Link href="/dashboard/accounts"
                          className="text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all bg-primary/10 px-4 py-2 rounded-xl flex items-center gap-2">
                        Manage Accounts
                        <ChevronRightIcon className="w-4 h-4"/>
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {accounts.slice(0, 4).map((account) => (<div key={account.id}
                                                                 className="bg-surface/80 backdrop-blur-sm p-5 rounded-2xl border border-surface-border/50 shadow-sm hover:shadow-md transition-all">
                                <span
                                    className="text-[10px] font-black text-primary uppercase tracking-widest">{account.type}</span>
                        <h4 className="text-sm font-bold text-foreground truncate mt-1">{account.name}</h4>
                        <div className="text-xl font-black text-foreground mt-2 tracking-tight">
                            {formatCurrency(account.balance, currency)}
                        </div>
                    </div>))}
                    {accounts.length === 0 && (<div
                        className="col-span-full py-12 text-center text-sm text-text-muted border-2 border-dashed border-surface-border/50 rounded-3xl bg-surface/30">
                        No accounts added yet.
                    </div>)}
                </div>
            </section>

            {/* Recent Activity */}
            <section className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <ClockIcon className="w-6 h-6 text-primary"/>
                        </div>
                        <h3 className="text-xl font-black text-foreground tracking-tight">Recent Transactions</h3>
                    </div>
                    <Link href="/dashboard/transactions"
                          className="text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all bg-primary/10 px-4 py-2 rounded-xl flex items-center gap-2">
                        View All
                        <ChevronRightIcon className="w-4 h-4"/>
                    </Link>
                </div>
                <div
                    className="bg-surface/80 backdrop-blur-sm rounded-3xl border border-surface-border/50 shadow-sm overflow-hidden min-h-64">
                    {transactions.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center space-y-4">
                            <div
                                className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center">
                                <ClockIcon className="w-8 h-8 text-text-muted"/>
                            </div>
                            <p className="text-sm font-medium text-text-muted">No recent transactions to display.</p>
                        </div>) : (<ul className="divide-y divide-surface-border/30">
                        {transactions.slice(0, 6).map((t: Transaction) => (<li key={t.id}
                                                                               className="p-5 flex items-center justify-between hover:bg-background/40 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-lg transition-transform group-hover:scale-110"
                                    style={{backgroundColor: t.categories?.color || '#3b82f6'}}
                                >
                                    {t.categories?.name?.charAt(0) || 'T'}
                                </div>
                                <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-foreground leading-tight truncate">
                          {t.notes || t.categories?.name || 'Uncategorized'}
                        </span>
                                    <span
                                        className="text-xs text-text-muted font-bold mt-1 uppercase tracking-wider">{new Date(t.date).toLocaleDateString(undefined, {
                                        month: 'short', day: 'numeric'
                                    })}</span>
                                </div>
                            </div>
                            <span
                                className={`text-base font-black tracking-tight ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(Number(t.amount), currency)}
                    </span>
                        </li>))}
                    </ul>)}
                </div>
            </section>

            {/* Budget Status */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <ChartPieIcon className="w-6 h-6 text-primary"/>
                        </div>
                        <h3 className="text-xl font-black text-foreground tracking-tight">Budget Status</h3>
                    </div>
                    <Link href="/dashboard/budgets"
                          className="text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all bg-primary/10 px-4 py-2 rounded-xl flex items-center gap-2">
                        View Details
                        <ChevronRightIcon className="w-4 h-4"/>
                    </Link>
                </div>
                <div
                    className="bg-surface/80 backdrop-blur-sm rounded-3xl border border-surface-border/50 shadow-sm p-6 min-h-64">
                    {budgets.length === 0 ? (<div
                        className="h-full flex flex-col items-center justify-center text-center space-y-6 py-10">
                        <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center">
                            <ChartPieIcon className="w-8 h-8 text-text-muted"/>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-bold text-foreground">No Budgets Set</p>
                            <p className="text-xs text-text-muted">Track your spending by setting your first monthly budget.</p>
                        </div>
                        <Link href="/dashboard/budgets"
                              className="text-xs font-bold text-primary bg-primary/10 px-6 py-3 rounded-xl hover:bg-primary hover:text-white transition-all">
                            Set a Budget Now
                        </Link>
                    </div>) : (<div className="space-y-6">
                        {budgets.slice(0, 4).map((budget: Budget) => {
                            const spent = spendingByCategory[budget.category_id] || 0;
                            const percentage = Math.min((spent / budget.amount) * 100, 100);
                            const isOver = spent > budget.amount;

                            return (<div key={budget.id} className="space-y-3">
                                <div className="flex justify-between items-center">
                                                <span
                                                    className="text-xs font-bold text-foreground uppercase tracking-wider">{budget.categories?.name}</span>
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                          {Math.round(percentage)}% used
                        </span>
                                </div>
                                <div
                                    className="w-full bg-background rounded-full h-2.5 overflow-hidden border border-surface-border/30">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-out ${isOver ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : percentage > 90 ? 'bg-amber-500' : 'bg-primary'}`}
                                        style={{width: `${percentage}%`}}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-text-muted">{formatCurrency(spent, currency)} spent</span>
                                    <span className="text-foreground">Goal: {formatCurrency(Number(budget.amount), currency)}</span>
                                </div>
                            </div>);
                        })}
                        {budgets.length > 4 && (<div className="pt-4 border-t border-surface-border/30 text-center">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                                + {budgets.length - 4} other active budgets
                            </p>
                        </div>)}
                    </div>)}
                </div>
            </section>
        </div>
    </div>);

}
