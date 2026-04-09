import { getInvestments } from "./actions";
import InvestmentForm from "./InvestmentForm";
import { Investment } from "@/types/database";
import { formatCurrency } from "@/utils/format";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function InvestmentsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('currency')
    .eq('id', user?.id)
    .single();

  const currency = profile?.currency || 'INR';
  const investments = await getInvestments();

  const totalInvested = investments.reduce((acc, inv) => acc + (Number(inv.quantity) * Number(inv.average_buy_price)), 0);
  const currentTotalValue = investments.reduce((acc, inv) => acc + Number(inv.current_value), 0);
  const totalPL = currentTotalValue - totalInvested;
  const plPercentage = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track your assets and market performance</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm text-right">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Value</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(currentTotalValue, currency)}</span>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm text-right">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Overall P&L</span>
            <span className={`text-xl font-bold ${totalPL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {totalPL >= 0 ? '+' : ''}{formatCurrency(totalPL, currency)} ({plPercentage.toFixed(2)}%)
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Asset</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Qty</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Avg. Price</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Current Value</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {investments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                      No investments added yet.
                    </td>
                  </tr>
                ) : (
                  investments.map((inv: Investment) => {
                    const invested = Number(inv.quantity) * Number(inv.average_buy_price);
                    const pl = Number(inv.current_value) - invested;
                    const plPct = invested > 0 ? (pl / invested) * 100 : 0;

                    return (
                      <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{inv.asset_name}</span>
                            <span className="text-xs text-gray-500 uppercase">{inv.symbol || '-'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 text-right">{Number(inv.quantity).toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 text-right">{formatCurrency(Number(inv.average_buy_price), currency)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white text-right">{formatCurrency(Number(inv.current_value), currency)}</td>
                        <td className={`px-6 py-4 text-sm font-bold text-right ${pl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          <div className="flex flex-col items-end">
                            <span>{pl >= 0 ? '+' : ''}{pl.toLocaleString()}</span>
                            <span className="text-[10px] opacity-80">{plPct.toFixed(2)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <InvestmentForm />
        </div>
      </div>
    </div>
  );
}
