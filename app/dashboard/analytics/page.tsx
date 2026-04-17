import {createClient} from "@/utils/supabase/server";
import {cookies} from "next/headers";
import {getCategories, getTransactions} from "@/actions/transactions";
import {formatCurrency} from "@/utils/format";
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ChartBarIcon,
  PresentationChartLineIcon
} from "@heroicons/react/24/outline";
import IncomeExpenseChart from "@/components/charts/IncomeExpenseChart";
import CategoryBreakdownChart from "@/components/charts/CategoryBreakdownChart";
import DailyCategoryChart from "@/components/charts/DailyCategoryChart";
import AIInsights from "@/components/dashboard/AIInsights";

export default async function AnalyticsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('currency')
    .eq('id', user?.id)
    .single();

  const currency = profile?.currency || 'INR';
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const [transactions, categories] = await Promise.all([
    getTransactions(),
    getCategories()
  ]);

  // 1. Monthly Stats
  const thisMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
  const income = thisMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const expenses = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const savings = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  // 2. Prepare Data for Daily Category Chart
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const dailyData: Record<string, string | number>[] = Array.from({ length: daysInMonth }, (_, i) => {
    const day = String(i + 1).padStart(2, '0');
    const dateStr = `${currentMonth}-${day}`;
    const dayTransactions = thisMonthTransactions.filter(t => t.date === dateStr && t.type === 'expense');

    const dayData: Record<string, string | number> = { date: day };
    expenseCategories.forEach(cat => {
      dayData[cat.name] = dayTransactions
          .filter(t => t.category_id === cat.id)
          .reduce((acc, t) => acc + Number(t.amount), 0);
    });

    return dayData;
  });

  // 3. Prepare Data for Monthly Trend (Last 6 Months)
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
      name: new Date(m + "-01").toLocaleDateString(undefined, { month: 'short' }),
      income: monthIncome,
      expense: monthExpense
    };
  });

  // 4. Prepare Category Breakdown Data
  const processCategoryData = (type: 'income' | 'expense') => {
    return Object.values(thisMonthTransactions
      .filter(t => t.type === type)
      .reduce((acc: Record<string, { name: string; value: number; color: string }>, t) => {
        const catName = t.categories?.name || 'Uncategorized';
        const catId = t.category_id || 'uncategorized';
        if (!acc[catId]) {
          acc[catId] = {
            name: catName, value: 0, color: t.categories?.color || (type === 'income' ? '#10b981' : '#ef4444')
          };
        }
        acc[catId].value += Number(t.amount);
        return acc;
      }, {}));
  };

  const expenseByCategoryData = processCategoryData('expense');
  const incomeByCategoryData = processCategoryData('income');

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Financial Analytics</h1>
        <p className="text-text-muted mt-1">Deep dive into your spending and income patterns</p>
      </header>

      {/* AI Section Placeholder */}
      <AIInsights />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-text-muted uppercase tracking-wider">Monthly Income</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">
            {formatCurrency(income, currency)}
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-text-muted uppercase tracking-wider">Monthly Expenses</span>
          </div>
          <div className="text-2xl font-bold text-red-600 mt-2">
            {formatCurrency(expenses, currency)}
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BanknotesIcon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-text-muted uppercase tracking-wider">Net Savings</span>
          </div>
          <div className={`text-2xl font-bold mt-2 ${savings >= 0 ? 'text-foreground' : 'text-red-600'}`}>
            {formatCurrency(savings, currency)}
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <ChartBarIcon className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-text-muted uppercase tracking-wider">Savings Rate</span>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">
            {savingsRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-3">
          <div className="flex items-center gap-3 mb-6">
            <PresentationChartLineIcon className="w-6 h-6 text-foreground" />
            <h3 className="text-xl font-bold text-foreground">Daily Expenses by Category</h3>
          </div>
          <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm">
            <DailyCategoryChart 
              data={dailyData} 
              categories={expenseCategories.map(c => ({ name: c.name, color: c.color || '#ef4444' }))}
              currency={currency} 
            />
          </div>
        </section>

        <section className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <ChartBarIcon className="w-6 h-6 text-foreground" />
            <h3 className="text-xl font-bold text-foreground">Monthly Income vs Expenses</h3>
          </div>
          <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm">
            <IncomeExpenseChart data={incomeExpenseData} currency={currency} />
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <ArrowTrendingDownIcon className="w-6 h-6 text-foreground" />
            <h3 className="text-xl font-bold text-foreground">Expense Breakdown</h3>
          </div>
          <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm">
            <CategoryBreakdownChart data={expenseByCategoryData} currency={currency} title="Expenses" />
          </div>
        </section>

        <section className="lg:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <ArrowTrendingUpIcon className="w-6 h-6 text-foreground" />
            <h3 className="text-xl font-bold text-foreground">Income Breakdown</h3>
          </div>
          <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm">
            <CategoryBreakdownChart data={incomeByCategoryData} currency={currency} title="Income" />
          </div>
        </section>
      </div>
    </div>
  );
}
