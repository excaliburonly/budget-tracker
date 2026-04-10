import Link from "next/link";
import { signup } from '@/actions/auth'
import { AuthInfo } from "@/components/auth/AuthInfo";

export default async function SignupPage(props: {
  searchParams: Promise<{ error: string }>;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background w-full overflow-x-hidden">
      {/* 40% Form Side (Left) */}
      <div className="w-full lg:w-[40%] shrink-0 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-[400px]">
          <div className="mb-10 text-left">
            <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Create Account</h2>
            <p className="text-text-muted">Start your journey to financial freedom today.</p>
          </div>

          {searchParams.error && (
            <div className="mb-8 p-4 text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl animate-fade-in-down">
              {searchParams.error}
            </div>
          )}

          <form className="space-y-6" action={signup}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/90" htmlFor="fullName">
                Full Name
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-input-border bg-input text-base focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-foreground placeholder:text-text-muted/50"
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/90" htmlFor="email">
                Email Address
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-input-border bg-input text-base focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-foreground placeholder:text-text-muted/50"
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/90" htmlFor="password">
                Password
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-input-border bg-input text-base focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-foreground placeholder:text-text-muted/50"
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>

            <button className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all" type="submit">
              Get Started
            </button>
          </form>

          <div className="mt-10 text-center text-base text-text-muted">
            Already have an account?{" "}
            <Link className="text-primary hover:underline font-bold" href="/login">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* 60% Info Side (Right) */}
      <div className="hidden lg:flex lg:flex-1 flex-col">
        <AuthInfo />
      </div>
    </div>
  );
}
