import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { User } from '@supabase/supabase-js'

export function Navbar({ user }: { user: User | null }) {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center border-b border-surface-border bg-surface">
      <Link className="flex items-center justify-center" href="/">
        <Logo size={32} />
        <span className="ml-2 text-xl font-bold tracking-tight text-foreground">Ledgr</span>
      </Link>
      <nav className="ml-auto flex items-center gap-2 sm:gap-6">
        {user ? (
          <Link
            className="text-xs sm:text-sm font-medium hover:text-primary transition-colors text-foreground"
            href="/dashboard"
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link
              className="text-xs sm:text-sm font-medium hover:text-primary transition-colors text-foreground"
              href="/login"
            >
              Login
            </Link>
            <Link
              className="text-xs sm:text-sm font-medium bg-primary text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md hover:bg-primary-hover transition-colors"
              href="/signup"
            >
              Get Started
            </Link>
          </>
        )}
        <div className="border-l border-surface-border pl-2 sm:pl-4">
          <ThemeToggle side="right" />
        </div>
      </nav>
    </header>
  )
}
