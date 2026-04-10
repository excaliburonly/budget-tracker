import Link from 'next/link'
import { CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { ThemeToggle } from '@/components/theme-toggle'
import { User } from '@supabase/supabase-js'

export function Navbar({ user }: { user: User | null }) {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center border-b border-surface-border bg-surface">
      <Link className="flex items-center justify-center" href="/">
        <CurrencyDollarIcon className="h-8 w-8 text-primary" />
        <span className="ml-2 text-xl font-bold tracking-tight text-foreground">Ledgr</span>
      </Link>
      <nav className="ml-auto flex items-center gap-4 sm:gap-6">
        {user ? (
          <Link
            className="text-sm font-medium hover:text-primary transition-colors text-foreground"
            href="/dashboard"
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link
              className="text-sm font-medium hover:text-primary transition-colors text-foreground"
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
        <div className="border-l border-surface-border pl-4">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
