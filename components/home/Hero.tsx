import Link from 'next/link'
import { User } from '@supabase/supabase-js'

export function Hero({ user }: { user: User | null }) {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-surface">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Master Your Money with <span className="text-primary">Ledgr</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-text-muted md:text-xl">
              Track earnings, expenses, budgets, and investments in one place.
              The simple, secure way to build your financial future.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-white shadow transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-white shadow transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Start Tracking Now
              </Link>
            )}
            <Link
              href="#features"
              className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-md border border-surface-border bg-surface text-foreground px-8 text-sm font-medium shadow-sm transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
