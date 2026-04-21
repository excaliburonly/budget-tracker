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
            name: catName, value: 0, color: t.categories?.color || (type === 'income' ? 'var(--success)' : 'var(--error)')
          };
        }
        acc[catId].value += Number(t.amount);
        return acc;
      }, {}));
  };

  const expenseByCategoryData = processCategoryData('expense');
  const incomeByCategoryData = processCategoryData('income');

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in-up">
      <header>
        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Financial Analytics</h1>
        <p className="text-text-muted mt-2 font-medium">Deep dive into your spending and income patterns</p>
      </header>

      {/* AI Section */}
      <section className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <AIInsights />
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 transition-colors">
              <ArrowTrendingUpIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Monthly Income</span>
          </div>
          <div className="text-3xl font-black tracking-tight text-emerald-600">
            {formatCurrency(income, currency)}
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-[10px] font-bold text-emerald-600/80 uppercase tracking-wider">
            Total inflow this month
          </div>
        </div>

        <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-500/10 rounded-2xl group-hover:bg-red-500/20 transition-colors">
              <ArrowTrendingDownIcon className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Monthly Expenses</span>
          </div>
          <div className="text-3xl font-black tracking-tight text-red-600">
            {formatCurrency(expenses, currency)}
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-[10px] font-bold text-red-600/80 uppercase tracking-wider">
            Total outflow this month
          </div>
        </div>

        <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors">
              <BanknotesIcon className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Net Savings</span>
          </div>
          <div className={`text-3xl font-black tracking-tight ${savings >= 0 ? 'text-foreground' : 'text-red-600'}`}>
            {formatCurrency(savings, currency)}
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Disposable income remaining
          </div>
        </div>

        <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl group-hover:bg-amber-500/20 transition-colors">
              <ChartBarIcon className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Savings Rate</span>
          </div>
          <div className="text-3xl font-black tracking-tight text-amber-600">
            {savingsRate.toFixed(1)}%
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-[10px] font-bold text-amber-600/80 uppercase tracking-wider">
            Efficiency of your income
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <section className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <PresentationChartLineIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-black text-foreground tracking-tight">Daily Expenses by Category</h3>
          </div>
          <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm">
            <DailyCategoryChart 
              data={dailyData} 
              categories={expenseCategories.map(c => ({ name: c.name, color: c.color || 'var(--error)' }))}
              currency={currency} 
            />
          </div>
        </section>

        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <ChartBarIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-black text-foreground tracking-tight">Monthly Trends</h3>
          </div>
          <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm">
            <IncomeExpenseChart data={incomeExpenseData} currency={currency} />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-xl">
              <ArrowTrendingDownIcon className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-black text-foreground tracking-tight">Spending Breakdown</h3>
          </div>
          <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm">
            <CategoryBreakdownChart data={expenseByCategoryData} currency={currency} title="Expenses" />
          </div>
        </section>

        <section className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-black text-foreground tracking-tight">Income Breakdown</h3>
              </div>
              <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm">
                <CategoryBreakdownChart data={incomeByCategoryData} currency={currency} title="Income" />
              </div>
            </div>
            
            <div className="bg-primary/5 rounded-3xl border border-primary/20 p-8 flex flex-col items-center justify-center text-center space-y-4">
               <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                 <PresentationChartLineIcon className="w-8 h-8 text-primary" />
               </div>
               <div className="space-y-2">
                 <h4 className="text-lg font-black text-foreground">Advanced Insights</h4>
                 <p className="text-sm text-text-muted max-w-xs">Use the AI generator at the top for personalized financial advice based on these patterns.</p>
               </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
