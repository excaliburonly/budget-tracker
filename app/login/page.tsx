import Link from "next/link";
import { login } from '@/actions/auth'
import { AuthInfo } from "@/components/auth/AuthInfo";

export default async function LoginPage(props: {
  searchParams: Promise<{ message: string; error: string }>;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* 60% Info Side (Left) */}
      <div className="hidden lg:flex lg:w-3/5">
        <AuthInfo />
      </div>

      {/* 40% Form Side (Right) */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-[400px]">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">Sign In</h2>
            <p className="text-text-muted">Welcome back! Please enter your details.</p>
          </div>

          {searchParams.error && (
            <div className="mb-8 p-4 text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl animate-fade-in-down">
              {searchParams.error}
            </div>
          )}
          {searchParams.message && (
            <div className="mb-8 p-4 text-sm text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-fade-in-down">
              {searchParams.message}
            </div>
          )}

          <form className="space-y-6" action={login}>
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
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-foreground/90" htmlFor="password">
                  Password
                </label>
              </div>
              <input
                className="w-full px-4 py-3 rounded-xl border border-input-border bg-input text-base focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-foreground placeholder:text-text-muted/50"
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            <button className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all" type="submit">
              Sign In
            </button>
          </form>

          <div className="mt-10 text-center text-base text-text-muted">
            Don&lsquo;t have an account?{" "}
            <Link className="text-primary hover:underline font-bold" href="/signup">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
