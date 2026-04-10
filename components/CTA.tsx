import Link from 'next/link'
import { User } from '@supabase/supabase-js'

export function CTA({ user }: { user: User | null }) {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6 mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6 text-foreground">
          Ready to take control?
        </h2>
        <p className="mx-auto max-w-[600px] text-text-muted md:text-xl mb-8">
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
  )
}
