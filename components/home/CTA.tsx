import Link from 'next/link'
import { User } from '@supabase/supabase-js'

export function CTA({ user }: { user: User | null }) {
  return (
    <section className="w-full py-20 md:py-32 relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto glass-panel p-10 md:p-16 rounded-[3rem] text-center border border-primary/20 shadow-2xl">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl mb-6 text-foreground">
            Ready to take control of your <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">wealth?</span>
          </h2>
          <p className="mx-auto max-w-[600px] text-text-muted md:text-xl mb-10 font-medium">
            Join thousands of smart investors who are building a better financial future with Ledgr.
          </p>
          <div className="flex justify-center">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-primary hover:bg-primary-hover px-10 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-primary hover:bg-primary-hover px-10 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Create Your Free Account
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
