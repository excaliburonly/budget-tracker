import { CheckCircleIcon, SparklesIcon, GlobeAsiaAustraliaIcon, ChartPieIcon } from '@heroicons/react/24/outline'

export function Benefits() {
  return (
    <section className="w-full py-24 lg:py-32 bg-surface">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          <div className="space-y-8 text-left">
            <div className="space-y-4">
               <div className="inline-block rounded-lg bg-emerald-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-600 border border-emerald-500/20">
                  Why Choose Ledgr
               </div>
               <h2 className="text-4xl font-black tracking-tight sm:text-5xl text-foreground">
                  Built for Financial <span className="text-primary italic">Clarity</span>
               </h2>
               <p className="text-text-muted md:text-xl font-medium leading-relaxed">
                  We built Ledgr to help you take control of your financial life without the complexity. 
                  Get a complete view of your wealth in one place.
               </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: SparklesIcon, text: "AI-Powered Wealth Insights", color: "text-primary" },
                { icon: GlobeAsiaAustraliaIcon, text: "Global Market Support", color: "text-emerald-500" },
                { icon: ChartPieIcon, text: "Dynamic Budget Tracking", color: "text-indigo-500" },
                { icon: CheckCircleIcon, text: "Privacy-First Architecture", color: "text-blue-500" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-background border border-surface-border/50 ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-foreground tracking-tight">{item.text}</span>
                </div>
              ))}
            </div>

            <ul className="space-y-4 pt-4">
              <li className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircleIcon className="h-3.5 w-3.5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-text-muted">Real-time transaction tracking across all account types</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircleIcon className="h-3.5 w-3.5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-text-muted">Automated balance and price synchronization with live APIs</span>
              </li>
            </ul>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-3xl" />
            <div className="relative bg-surface p-8 sm:p-12 rounded-[3rem] border border-surface-border shadow-2xl overflow-hidden group">
               <div className="space-y-8">
                  {/* Fake UI Elements */}
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-1/3 bg-background rounded-xl border border-surface-border/50" />
                    <div className="h-10 w-10 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center">
                      <SparklesIcon className="w-5 h-5 text-primary animate-pulse" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 p-6 bg-primary/5 rounded-3xl border border-primary/10 transition-transform group-hover:-translate-y-1 duration-500">
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Portfolio</span>
                      <div className="h-8 w-full bg-primary/20 rounded-lg animate-pulse" />
                    </div>
                    <div className="space-y-2 p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 transition-transform group-hover:translate-y-1 duration-500 delay-100">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Live Rate</span>
                      <div className="h-8 w-full bg-emerald-500/20 rounded-lg" />
                    </div>
                  </div>

                  <div className="p-8 bg-background rounded-[2.5rem] border border-surface-border/50 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-1/2 bg-surface rounded-full" />
                      <div className="h-4 w-12 bg-primary/20 rounded-full" />
                    </div>
                    <div className="w-full h-3 bg-surface rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[85%] rounded-full" />
                    </div>
                    <div className="flex justify-between">
                      <div className="h-3 w-16 bg-surface rounded-full" />
                      <div className="h-3 w-20 bg-surface rounded-full" />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="w-2 h-2 rounded-full bg-surface-border" />
                    <div className="w-2 h-2 rounded-full bg-surface-border" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

