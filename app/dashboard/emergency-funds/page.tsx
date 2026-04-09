import { getEmergencyFunds } from "./actions";
import EmergencyFundForm from "./EmergencyFundForm";
import { EmergencyFund } from "@/types/database";
import { formatCurrency } from "@/utils/format";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function EmergencyFundsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('currency')
    .eq('id', user?.id)
    .single();

  const currency = profile?.currency || 'INR';
  const funds = await getEmergencyFunds();

  const totalCurrentAmount = funds.reduce((acc, f) => acc + Number(f.current_amount), 0);
  const totalTargetAmount = funds.reduce((acc, f) => acc + Number(f.target_amount), 0);
  const totalPercentage = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Emergency Funds</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track your security buffer across different financial instruments</p>
      </header>

      {/* Global Progress Overview */}
      <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm mb-10 overflow-hidden relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Total Progress</h3>
            <p className="text-sm text-gray-500">Combined balance of all emergency funds</p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-extrabold text-emerald-600 tracking-tight">
              {formatCurrency(totalCurrentAmount, currency)}
            </span>
            <p className="text-sm text-gray-400 mt-1">
              Goal: {formatCurrency(totalTargetAmount, currency)}
            </p>
          </div>
        </div>

        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden mb-2">
          <div 
            className="h-full bg-emerald-500 transition-all duration-1000 ease-in-out relative shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            style={{ width: `${Math.min(totalPercentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          <span>{totalPercentage.toFixed(1)}% Completed</span>
          <span>{totalPercentage >= 100 ? "Goal Reached!" : `${(100 - totalPercentage).toFixed(1)}% to go`}</span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            Fund Instruments
          </h3>
          
          {funds.length === 0 ? (
             <div className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 h-48 flex flex-col items-center justify-center p-6 text-center">
             <p className="text-gray-500 dark:text-gray-400">No emergency funds created yet.</p>
             <p className="text-sm text-gray-400 mt-1">Start by defining where you park your emergency money.</p>
           </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {funds.map((fund: EmergencyFund) => {
                const percentage = Math.min((Number(fund.current_amount) / Number(fund.target_amount)) * 100, 100);
                
                return (
                  <div key={fund.id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">{fund.instrument_type}</span>
                          <h4 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{fund.name}</h4>
                          <span className="text-xs text-gray-500 font-medium">{fund.institution_name || 'Personal Custody'}</span>
                        </div>
                      </div>

                      <div className="flex justify-between text-sm mb-2 pt-4">
                        <span className="text-gray-500">Balance</span>
                        <span className="text-gray-900 dark:text-white font-bold">{formatCurrency(Number(fund.current_amount), currency)}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden mb-6">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Target</span>
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{formatCurrency(Number(fund.target_amount), currency)}</span>
                      </div>
                      <div className="text-right">
                         <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[10px] font-extrabold">
                            {percentage.toFixed(0)}% READY
                         </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <EmergencyFundForm />
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
            <h4 className="text-sm font-bold text-blue-800 dark:text-blue-400 mb-2">💡 Pro-tip</h4>
            <p className="text-xs text-blue-700/80 dark:text-blue-400/80 leading-relaxed">
              When adding a transaction, select an Emergency Fund to automatically update its balance. This helps you track transfers to your security buffer in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
