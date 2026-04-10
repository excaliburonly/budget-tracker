import { ChartBarIcon, ArrowTrendingUpIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

export function Features() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary/20 px-3 py-1 text-sm font-medium text-primary">
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Everything you need to succeed
            </h2>
            <p className="max-w-[900px] text-text-muted md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Stop guessing where your money goes. Ledgr gives you the tools to monitor
              every dollar and plan for what matters most.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-link-hover-bg">
              <ChartBarIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Monthly Budgets</h3>
            <p className="text-text-muted">
              Set monthly limits per category and visualize your progress with real-time updates.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold">Investment Tracking</h3>
            <p className="text-text-muted">
              Monitor your portfolio assets, track performance, and watch your wealth grow.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-900/20">
              <ShieldCheckIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-bold">Emergency Funds</h3>
            <p className="text-text-muted">
              Stay prepared for life&apos;s surprises by tracking your savings goals across various instruments.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
