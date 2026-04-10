import { CheckCircleIcon } from '@heroicons/react/24/outline'

export function Benefits() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-surface">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Built for Financial Clarity
            </h2>
            <p className="text-text-muted md:text-xl/relaxed">
              We built Ledgr to help you take control of your financial life without the complexity.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span>Real-time transaction tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span>Automated balance synchronization</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span>Privacy by design with RLS security</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span>Beautiful, modern dashboard</span>
              </li>
            </ul>
          </div>
          <div className="bg-surface p-4 sm:p-8 rounded-xl border border-surface-border shadow-sm">
             <div className="space-y-4">
                <div className="h-4 w-1/3 bg-background rounded animate-pulse" />
                <div className="h-8 w-full bg-background rounded" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="h-24 bg-link-hover-bg rounded-lg border border-blue-100 dark:border-blue-900/30 flex flex-col justify-center px-4">
                      <span className="text-xs text-primary font-medium">Monthly Savings</span>
                      <span className="text-lg font-bold text-foreground">$2,450.00</span>
                   </div>
                   <div className="h-24 bg-emerald-500/10 rounded-lg border border-emerald-500/20 flex flex-col justify-center px-4">
                      <span className="text-xs text-emerald-600 font-medium">Net Worth</span>
                      <span className="text-lg font-bold text-emerald-600">$45,210.00</span>
                   </div>
                </div>
                   <div className="h-32 bg-background rounded-lg border border-surface-border p-4">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-text-muted">Groceries Budget</span>
                      <span className="text-xs font-bold text-foreground">75%</span>
                   </div>
                   <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[75%]" />
                   </div>
                   <div className="mt-4 flex justify-between text-[10px] text-text-muted">
                      <span>$0.00</span>
                      <span>Budget: $500.00</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  )
}
