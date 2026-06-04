import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { User } from '@supabase/supabase-js'

export function Navbar({ user }: { user: User | null }) {
  return (
    <header className="sticky top-0 z-50 px-4 lg:px-8 h-16 flex items-center border-b border-surface-border bg-surface/70 backdrop-blur-md shadow-xs">
      <Link className="flex items-center justify-center group" href="/">
        <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 transition-all duration-500 group-hover:scale-105 group-hover:rotate-6">
          <Logo size={20} />
        </div>
        <span className="ml-2.5 text-lg font-black tracking-tight text-foreground bg-clip-text">Ledgr</span>
      </Link>
      <nav className="ml-auto flex items-center gap-3 sm:gap-6">
        {user ? (
          <Link
            className="text-xs sm:text-sm font-bold hover:text-primary transition-colors text-foreground bg-primary/5 hover:bg-primary/10 px-4.5 py-2 rounded-xl border border-primary/10"
            href="/dashboard"
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link
              className="text-xs sm:text-sm font-bold hover:text-primary transition-colors text-foreground/80 hover:text-foreground px-3 py-2 rounded-xl"
              href="/login"
            >
              Login
            </Link>
            <Link
              className="text-xs sm:text-sm font-black uppercase tracking-wider bg-primary hover:bg-primary-hover text-white px-4.5 py-2.5 rounded-xl shadow-md shadow-primary/10 active:scale-95 transition-all duration-200"
              href="/signup"
            >
              Get Started
            </Link>
          </>
        )}
        <div className="border-l border-surface-border pl-3 sm:pl-4">
          <ThemeToggle side="right" />
        </div>
      </nav>
    </header>
  )
}
