import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { SparklesIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'

export function Hero({ user }: { user: User | null }) {
  return (
    <section className="relative w-full py-20 md:py-32 lg:py-40 bg-surface overflow-hidden bg-grid-pattern">
      {/* Decorative background lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none animate-pulse-glow" />

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="flex flex-col items-center space-y-8 text-center">
          {/* AI Banner Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-black uppercase tracking-wider text-primary shadow-xs animate-fade-in-down">
            <SparklesIcon className="w-4 h-4 text-primary animate-pulse" />
            Now Powered by Gemini AI Insights
          </div>

          <div className="space-y-4 max-w-4xl">
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl md:text-7xl/none text-foreground leading-none">
              Master Your Wealth with <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-purple-600">
                Next-Gen Finance
              </span>
            </h1>
            <p className="mx-auto max-w-[750px] text-text-muted md:text-xl font-medium leading-relaxed">
              Track assets, budgets, international stock portfolios, and SIPs automatically. 
              Get data-driven investment advisory tailored to your financial goals.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl bg-primary hover:bg-primary-hover px-8 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 duration-200"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl bg-primary hover:bg-primary-hover px-8 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 duration-200"
              >
                Start Tracking Now
              </Link>
            )}
            <Link
              href="#features"
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl border border-surface-border bg-surface/50 backdrop-blur-sm text-foreground/80 hover:text-foreground px-8 text-sm font-bold shadow-xs transition-all hover:bg-background hover:scale-105 active:scale-95 duration-200"
            >
              Learn More
            </Link>
          </div>

          {/* Floating UI Mockup Dashboard */}
          <div className="w-full max-w-5xl mt-12 bg-linear-to-b from-primary/15 via-surface-border/20 to-transparent p-1.5 rounded-[2.5rem] shadow-2xl relative animate-fade-in-up">
            <div className="bg-surface/90 backdrop-blur-lg rounded-[2.3rem] border border-surface-border/50 p-6 md:p-10 flex flex-col md:flex-row gap-8 text-left overflow-hidden">
              <div className="flex-1 space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Overview</span>
                  <h3 className="text-3xl font-black text-foreground mt-1">Ledgr Dashboard</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-background/50 rounded-2xl border border-surface-border/50">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Total Net Worth</span>
                    <p className="text-2xl font-black text-foreground mt-1">₹18,45,200.00</p>
                  </div>
                  <div className="p-5 bg-background/50 rounded-2xl border border-surface-border/50">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Investments</span>
                    <p className="text-2xl font-black text-primary mt-1">₹8,12,000.00</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                    <SparklesIcon className="w-5 h-5 text-primary shrink-0 animate-pulse" />
                    <p className="text-xs text-foreground/80 font-bold">AI Suggestion: Reallocate 5% to index fund for goal &quot;Retire 2045&quot;.</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                    <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                    <p className="text-xs text-foreground/80 font-bold">Your savings rate increased by 14% compared to last month.</p>
                  </div>
                </div>
              </div>

              {/* Graphic charts mock */}
              <div className="flex-1 bg-background/40 rounded-3xl border border-surface-border/40 p-6 flex flex-col justify-between min-h-[220px]">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-wider text-text-muted">Growth Performance</span>
                  <span className="text-[10px] font-bold bg-primary/15 text-primary px-2.5 py-1 rounded-lg">+22.4%</span>
                </div>
                {/* Fake SVG Chart */}
                <div className="w-full h-32 flex items-end gap-2.5 pt-4">
                  {[45, 60, 52, 78, 70, 92, 105].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-gradient-to-t from-primary via-indigo-400 to-indigo-300 rounded-t-lg transition-all duration-1000 hover:opacity-80" 
                        style={{ height: `${val}px` }} 
                      />
                      <span className="text-[9px] font-bold text-text-muted">M{idx+1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
