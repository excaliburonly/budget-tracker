import { ChartPieIcon, ShieldCheckIcon, BanknotesIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'

export function AuthInfo() {
  const features = [
    {
      title: "Budgeting",
      description: "Smart category-based limits to help you save more.",
      icon: ChartPieIcon,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Investments",
      description: "Portfolio tracking to watch your wealth grow.",
      icon: ArrowTrendingUpIcon,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      title: "Emergency Fund",
      description: "Financial security for peace of mind when it matters.",
      icon: ShieldCheckIcon,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      title: "Cash Flow",
      description: "Monitor every transaction with effortless ease.",
      icon: BanknotesIcon,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    }
  ]

  return (
    <div className="flex flex-col w-full h-full justify-center p-12 lg:p-16 text-foreground bg-surface border-l border-surface-border relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="mb-12 relative z-10">
        <h1 className="text-4xl font-bold mb-4 tracking-tight text-primary">Ledgr</h1>
        <p className="text-xl text-text-muted max-w-md">
          Master your finances with the most intuitive personal budget tracker.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl relative z-10">
        {features.map((feature) => (
          <div key={feature.title} className="flex gap-4 items-start group">
            <div className={`mt-1 p-2.5 rounded-xl bg-background border border-surface-border shadow-sm group-hover:scale-110 group-hover:border-primary/30 transition-all duration-300`}>
              <feature.icon className={`h-6 w-6 text-primary`} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-16 border-t border-surface-border relative z-10">
        <p className="text-sm text-text-muted">
          © {new Date().getFullYear()} Ledgr. All rights reserved.
        </p>
      </div>
    </div>
  )
}
