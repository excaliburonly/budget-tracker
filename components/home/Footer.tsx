import Link from 'next/link'

export function Footer() {
  return (
    <footer className="w-full shrink-0 border-t border-surface-border bg-surface/50 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-8 py-8 flex flex-col gap-4 sm:flex-row items-center justify-between">
        <p className="text-xs font-bold text-text-muted">
          © 2026 Ledgr Inc. All rights reserved.
        </p>
        <nav className="flex gap-6">
          <Link className="text-xs font-bold text-text-muted/80 hover:text-primary transition-colors" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs font-bold text-text-muted/80 hover:text-primary transition-colors" href="#">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  )
}
