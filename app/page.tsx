import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-surface-border">
        <Link className="flex items-center justify-center" href="/">
          <CurrencyDollarIcon className="h-8 w-8 text-primary" />
          <span className="ml-2 text-xl font-bold tracking-tight">Ledgr</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          {user ? (
            <Link
              className="text-sm font-medium hover:text-primary transition-colors"
              href="/dashboard"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                className="text-sm font-medium hover:text-primary transition-colors"
                href="/login"
              >
                Login
              </Link>
              <Link
                className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors"
                href="/signup"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-surface">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Master Your Money with <span className="text-primary">Ledgr</span>
                </h1>
                <p className="mx-auto max-w-175 text-gray-500 md:text-xl dark:text-gray-400">
                  Track earnings, expenses, budgets, and investments in one place.
                  The simple, secure way to build your financial future.
                </p>
              </div>
              <div className="space-x-4">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-white shadow transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/signup"
                    className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-white shadow transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    Start Tracking Now
                  </Link>
                )}
                <Link
                  href="#features"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-surface-border bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-primary">
                  Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Everything you need to succeed
                </h2>
                <p className="max-w-225 text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Stop guessing where your money goes. Ledgr gives you the tools to monitor
                  every dollar and plan for what matters most.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                  <ChartBarIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Monthly Budgets</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Set monthly limits per category and visualize your progress with real-time updates.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                  <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Investment Tracking</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Monitor your portfolio assets, track performance, and watch your wealth grow.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
                  <ShieldCheckIcon className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold">Emergency Funds</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Stay prepared for life&lsquos surprises by tracking your savings goals across various instruments.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-surface">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Built for Financial Clarity
                </h2>
                <p className="text-gray-500 dark:text-gray-400 md:text-xl/relaxed">
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
              <div className="bg-white p-8 rounded-xl border border-surface-border shadow-sm">
                 <div className="space-y-4">
                    <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
                    <div className="h-8 w-full bg-gray-50 rounded" />
                    <div className="grid grid-cols-2 gap-4">
                       <div className="h-24 bg-blue-50 rounded-lg border border-blue-100 flex flex-col justify-center px-4">
                          <span className="text-xs text-blue-600 font-medium">Monthly Savings</span>
                          <span className="text-lg font-bold text-blue-900">$2,450.00</span>
                       </div>
                       <div className="h-24 bg-green-50 rounded-lg border border-green-100 flex flex-col justify-center px-4">
                          <span className="text-xs text-green-600 font-medium">Net Worth</span>
                          <span className="text-lg font-bold text-green-900">$45,210.00</span>
                       </div>
                    </div>
                    <div className="h-32 bg-gray-50 rounded-lg border border-gray-100 p-4">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-500">Groceries Budget</span>
                          <span className="text-xs font-bold text-gray-900">75%</span>
                       </div>
                       <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-primary h-full w-[75%]" />
                       </div>
                       <div className="mt-4 flex justify-between text-[10px] text-gray-400">
                          <span>$0.00</span>
                          <span>Budget: $500.00</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
              Ready to take control?
            </h2>
            <p className="mx-auto max-w-150 text-gray-500 md:text-xl dark:text-gray-400 mb-8">
              Join thousands of users who are building a better financial future with Ledgr.
            </p>
            {user ? (
               <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-10 text-base font-medium text-white shadow transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-10 text-base font-medium text-white shadow transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Create Your Free Account
              </Link>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-surface-border">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2026 Ledgr Inc. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
