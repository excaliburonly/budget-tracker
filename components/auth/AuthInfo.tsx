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
    <div className="flex flex-col h-full justify-center p-12 lg:p-16 text-white bg-linear-to-br from-primary to-blue-700 dark:from-primary dark:to-blue-900">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 tracking-tight">Ledgr</h1>
        <p className="text-xl text-blue-50/80 max-w-md">
          Master your finances with the most intuitive personal budget tracker.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl">
        {features.map((feature) => (
          <div key={feature.title} className="flex gap-4 items-start group">
            <div className={`mt-1 p-2.5 rounded-xl ${feature.bgColor} bg-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform`}>
              <feature.icon className={`h-6 w-6 text-white`} />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-sm text-blue-50/70 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-16 border-t border-white/10">
        <p className="text-sm text-blue-50/50">
          © {new Date().getFullYear()} Ledgr. All rights reserved.
        </p>
      </div>
    </div>
  )
}
