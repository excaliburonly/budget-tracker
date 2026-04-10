import Link from "next/link";
import { signup } from "@/app/auth/actions";

export default async function SignupPage(props: {
  searchParams: Promise<{ error: string }>;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-width-[400px] p-8 bg-surface border border-surface-border rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Ledgr</h1>
          <p className="text-text-muted text-sm">Create your new account</p>
        </div>

        {searchParams.error && (
          <div className="mb-6 p-3 text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded-lg">
            {searchParams.error}
          </div>
        )}

        <form className="flex flex-col gap-5" action={signup}>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground/80" htmlFor="fullName">
              Full Name
            </label>
            <input
              className="px-4 py-2.5 rounded-lg border border-input-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              id="fullName"
              name="fullName"
              type="text"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground/80" htmlFor="email">
              Email Address
            </label>
            <input
              className="px-4 py-2.5 rounded-lg border border-input-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground/80" htmlFor="password">
              Password
            </label>
            <input
              className="px-4 py-2.5 rounded-lg border border-input-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          <button className="mt-2 w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors" type="submit">
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link className="text-primary hover:underline font-medium" href="/login">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
