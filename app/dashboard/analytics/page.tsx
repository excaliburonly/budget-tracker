import { Suspense } from "react";
import AnalyticsTabs from "@/components/dashboard/AnalyticsTabs";
import { LoadingSpinner } from "@/components/theme/Loading";
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ChartBarIcon,
  PresentationChartLineIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import IncomeExpenseChart from "@/components/charts/IncomeExpenseChart";
import CategoryBreakdownChart from "@/components/charts/CategoryBreakdownChart";
import DailyCategoryChart from "@/components/charts/DailyCategoryChart";
import NetWorthChart from "@/components/charts/NetWorthChart";
import AIInsights from "@/components/dashboard/AIInsights";
import WhatIfSimulator from "@/components/dashboard/WhatIfSimulator";
import FinancialHealthReport from "@/components/dashboard/FinancialHealthReport";
import InvestmentPerformanceChart from "@/components/charts/InvestmentPerformanceChart";
import { getInvestmentPerformance, getInvestments, getIndividualInvestmentPerformance } from "@/actions/investments";
import { getNetWorthHistory, updateNetWorthSnapshot } from "@/actions/profiles";
import { getCategories, getTransactions } from "@/actions/transactions";
import { formatCurrency } from "@/utils/format";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function AnalyticsPage(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams;
  const activeTab = searchParams.tab || "general";

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <header>
        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Financial Analytics</h1>
        <p className="text-text-muted mt-2 font-medium">Deep dive into your patterns and AI-powered insights</p>
      </header>

      <Suspense fallback={<div className="h-12 w-64 bg-surface animate-pulse rounded-full" />}>
        <AnalyticsTabs />
      </Suspense>

      <Suspense fallback={<div className="py-20"><LoadingSpinner label={`Loading ${activeTab} analytics...`} /></div>}>
        <AnalyticsContent activeTab={activeTab} />
      </Suspense>
    </div>
  );
}

async function AnalyticsContent({ activeTab }: { activeTab: string }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('currency, subscription_tier')
    .eq('id', user?.id)
    .single();

  const currency = profile?.currency || 'INR';
  const subscriptionTier = profile?.subscription_tier || 'free';
  const currentMonth = new Date().toISOString().slice(0, 7);

  if (activeTab === "ai") {
    return (
      <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <section>
          <FinancialHealthReport />
        </section>
        
        <section className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <AIInsights />
        </section>
        
        <section>
          <WhatIfSimulator subscriptionTier={subscriptionTier} currency={currency} />
        </section>
      </div>
    );
  }

  if (activeTab === "investments") {
    const [allInvestments, mfPerformance, stockPerformance] = await Promise.all([
      getInvestments(),
      getInvestmentPerformance("Mutual Fund"),
      getInvestmentPerformance("Stock")
    ]);

    const individualPerformances = await Promise.all(
      allInvestments.map(async (inv) => ({
        id: inv.id,
        data: await getIndividualInvestmentPerformance(inv.id)
      }))
    ).then(results => Object.fromEntries(results.map(r => [r.id, r.data])));

    return (
      <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <PresentationChartLineIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight">Mutual Funds Portfolio</h3>
              <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-0.5">Combined Performance</p>
            </div>
          </div>
          <div className="bg-surface/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-surface-border/50 shadow-sm">
            <InvestmentPerformanceChart data={mfPerformance} currency={currency} />
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <ArrowTrendingUpIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight">Stocks Portfolio</h3>
              <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-0.5">Combined Performance</p>
            </div>
          </div>
          <div className="bg-surface/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-surface-border/50 shadow-sm">
            <InvestmentPerformanceChart data={stockPerformance} currency={currency} />
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <SparklesIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight">Individual Asset Performance</h3>
              <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-0.5">Track every holding</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {allInvestments.map((inv) => (
              <div key={inv.id} className="bg-surface/80 backdrop-blur-sm p-6 rounded-[2rem] border border-surface-border/50 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-foreground tracking-tight truncate max-w-[250px]">{inv.asset_name}</h4>
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">{inv.investment_type} • {inv.symbol || 'No Symbol'}</p>
                  </div>
                </div>
                <div>
                  <InvestmentPerformanceChart data={individualPerformances[inv.id]} currency={currency} height={200} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // General tab (default)
  await updateNetWorthSnapshot();
  const [transactions, categories, netWorthHistory] = await Promise.all([
    getTransactions(),
    getCategories(),
    getNetWorthHistory()
  ]);

  const thisMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
  const income = thisMonthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const expenses = thisMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  const monthInvestments = thisMonthTransactions.filter(t => t.type === 'investment').reduce((acc, t) => acc + Number(t.amount), 0);
  const savings = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'investment');
  const dailyData = Array.from({ length: 31 }, (_, i) => {
    const day = String(i + 1).padStart(2, '0');
    const dateStr = `${currentMonth}-${day}`;
    const dayTransactions = thisMonthTransactions.filter(t => t.date.startsWith(dateStr) && (t.type === 'expense' || t.type === 'investment'));
    const dayData: Record<string, string | number> = { date: day };
    expenseCategories.forEach(cat => {
      dayData[cat.name] = dayTransactions.filter(t => t.category_id === cat.id).reduce((acc, t) => acc + Number(t.amount), 0);
    });
    return dayData;
  });

  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(d.toISOString().slice(0, 7));
  }
  const incomeExpenseData = months.map(m => {
    const monthIncome = transactions.filter(t => t.date.startsWith(m) && t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const monthExpense = transactions.filter(t => t.date.startsWith(m) && (t.type === 'expense' || t.type === 'investment')).reduce((acc, t) => acc + Number(t.amount), 0);
    return { name: new Date(m + "-01").toLocaleDateString(undefined, { month: 'short' }), income: monthIncome, expense: monthExpense };
  });

  const processCategoryData = (type: 'income' | 'expense' | 'investment') => {
    return Object.values(thisMonthTransactions.filter(t => t.type === type).reduce((acc: Record<string, { name: string; value: number; color: string }>, t) => {
        const catName = t.categories?.name || 'Uncategorized';
        const catId = t.category_id || 'uncategorized';
        if (!acc[catId]) {
          acc[catId] = { name: catName, value: 0, color: t.categories?.color || (type === 'income' ? 'var(--success)' : (type === 'investment' ? 'var(--primary)' : 'var(--error)')) };
        }
        acc[catId].value += Number(t.amount);
        return acc;
    }, {}));
  };

  const expenseByCategoryData = processCategoryData('expense');
  const investmentByCategoryData = processCategoryData('investment');
  const incomeByCategoryData = processCategoryData('income');

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 transition-colors"><ArrowTrendingUpIcon className="w-6 h-6 text-emerald-600" /></div>
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Income</span>
          </div>
          <div className="text-2xl font-black tracking-tight text-emerald-600">{formatCurrency(income, currency)}</div>
          <div className="flex items-center gap-1.5 mt-3 text-[10px] font-bold text-emerald-600/80 uppercase tracking-wider">Total inflow</div>
        </div>
        <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-500/10 rounded-2xl group-hover:bg-red-500/20 transition-colors"><ArrowTrendingDownIcon className="w-6 h-6 text-red-600" /></div>
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Expenses</span>
          </div>
          <div className="text-2xl font-black tracking-tight text-red-600">{formatCurrency(expenses, currency)}</div>
          <div className="flex items-center gap-1.5 mt-3 text-[10px] font-bold text-red-600/80 uppercase tracking-wider">Total outflow</div>
        </div>
        <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors"><PresentationChartLineIcon className="w-6 h-6 text-primary" /></div>
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Invested</span>
          </div>
          <div className="text-2xl font-black tracking-tight text-primary">{formatCurrency(monthInvestments, currency)}</div>
          <div className="flex items-center gap-1.5 mt-3 text-[10px] font-bold text-primary/80 uppercase tracking-wider">Wealth built</div>
        </div>
        <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-500/10 rounded-2xl group-hover:bg-indigo-500/20 transition-colors"><BanknotesIcon className="w-6 h-6 text-indigo-600" /></div>
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Net Savings</span>
          </div>
          <div className={`text-2xl font-black tracking-tight ${savings >= 0 ? 'text-foreground' : 'text-red-600'}`}>{formatCurrency(savings, currency)}</div>
          <div className="flex items-center gap-1.5 mt-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Leftover funds</div>
        </div>
        <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl group-hover:bg-amber-500/20 transition-colors"><ChartBarIcon className="w-6 h-6 text-amber-600" /></div>
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Savings Rate</span>
          </div>
          <div className="text-2xl font-black tracking-tight text-amber-600">{savingsRate.toFixed(1)}%</div>
          <div className="flex items-center gap-1.5 mt-3 text-[10px] font-bold text-amber-600/80 uppercase tracking-wider">Efficiency</div>
        </div>
      </div>

      <section>
        <NetWorthChart data={netWorthHistory} currency={currency} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <section className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl"><PresentationChartLineIcon className="w-6 h-6 text-primary" /></div>
            <h3 className="text-xl font-black text-foreground tracking-tight">Daily Expenses by Category</h3>
          </div>
          <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm">
            <DailyCategoryChart data={dailyData} categories={expenseCategories.map(c => ({ name: c.name, color: c.color || 'var(--error)' }))} currency={currency} />
          </div>
        </section>
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl"><ChartBarIcon className="w-6 h-6 text-primary" /></div>
            <h3 className="text-xl font-black text-foreground tracking-tight">Monthly Trends</h3>
          </div>
          <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm">
            <IncomeExpenseChart data={incomeExpenseData} currency={currency} />
          </div>
        </section>
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-xl"><ArrowTrendingDownIcon className="w-6 h-6 text-red-600" /></div>
            <h3 className="text-xl font-black text-foreground tracking-tight">Spending Breakdown</h3>
          </div>
          <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm">
            <CategoryBreakdownChart data={expenseByCategoryData} currency={currency} title="Expenses" />
          </div>
        </section>
        <section className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl"><ArrowTrendingUpIcon className="w-6 h-6 text-emerald-600" /></div>
                <h3 className="text-xl font-black text-foreground tracking-tight">Income Breakdown</h3>
              </div>
              <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm">
                <CategoryBreakdownChart data={incomeByCategoryData} currency={currency} title="Income" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl"><PresentationChartLineIcon className="w-6 h-6 text-primary" /></div>
                <h3 className="text-xl font-black text-foreground tracking-tight">Investment Allocation</h3>
              </div>
              <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-3xl border border-surface-border/50 shadow-sm">
                <CategoryBreakdownChart data={investmentByCategoryData} currency={currency} title="Investments" />
              </div>
            </div>
            <div className="bg-primary/5 rounded-3xl border border-primary/20 p-8 flex flex-col items-center justify-center text-center space-y-4">
               <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center"><PresentationChartLineIcon className="w-8 h-8 text-primary" /></div>
               <div className="space-y-2">
                 <h4 className="text-lg font-black text-foreground">Advanced Insights</h4>
                 <p className="text-sm text-text-muted max-w-xs">Switch to the AI Financial Advisor tab for personalized insights and simulations.</p>
               </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
