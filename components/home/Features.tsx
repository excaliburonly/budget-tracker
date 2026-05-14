import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ShieldCheckIcon, 
  SparklesIcon, 
  GlobeAltIcon, 
  PresentationChartLineIcon,
  BanknotesIcon,
  FlagIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline'

export function Features() {
  const features = [
    {
      name: 'AI Investment Advisor',
      description: 'Get personalized, data-driven investment guidance powered by Gemini. Real-time portfolio analysis and strategic advice tailored to your goals.',
      icon: SparklesIcon,
      color: 'bg-primary/10 text-primary',
      premium: true
    },
    {
      name: 'Global Portfolio Tracking',
      description: 'Manage Indian and International stock wallets with ease. Real-time NAV syncing and automated exchange rate conversions for major global markets.',
      icon: GlobeAltIcon,
      color: 'bg-emerald-500/10 text-emerald-600',
      premium: false
    },
    {
      name: '"What-If" Simulator',
      description: 'Run powerful financial simulations. See how changing your income, expenses, or investments impacts your wealth over decades.',
      icon: PresentationChartLineIcon,
      color: 'bg-indigo-500/10 text-indigo-600',
      premium: true
    },
    {
      name: 'Smart Categorization',
      description: 'Stop manual entry fatigue. Our AI suggests categories for your transactions automatically based on your spending habits.',
      icon: ChartBarIcon,
      color: 'bg-blue-500/10 text-blue-600',
      premium: true
    },
    {
      name: 'Investment Automation',
      description: 'Track SIPs, automated wealth syncing, and detailed performance charts. Watch your money work for you with zero manual effort.',
      icon: ArrowTrendingUpIcon,
      color: 'bg-orange-500/10 text-orange-600',
      premium: false
    },
    {
      name: 'Dynamic Budgeting',
      description: 'Set monthly limits by category and track progress in real-time. Stay on top of your spending with beautiful interactive indicators.',
      icon: BanknotesIcon,
      color: 'bg-yellow-500/10 text-yellow-600',
      premium: false
    },
    {
      name: 'Financial Goal Tracking',
      description: 'Define, track, and achieve your life goals. Whether it\'s a new home or retirement, stay on path with intelligent progress tracking.',
      icon: FlagIcon,
      color: 'bg-pink-500/10 text-pink-600',
      premium: false
    },
    {
      name: 'Deep Financial Analytics',
      description: 'Gain powerful insights with interactive charts, net worth tracking, and category breakdowns. Visualize your financial journey with precision.',
      icon: ChartPieIcon,
      color: 'bg-cyan-500/10 text-cyan-600',
      premium: false
    },
    {
      name: 'Enterprise-Grade Security',
      description: 'Your data is secured with Supabase RLS and encryption. We prioritize your privacy and financial data integrity above all else.',
      icon: ShieldCheckIcon,
      color: 'bg-red-500/10 text-red-600',
      premium: false
    }
  ]

  return (
    <section id="features" className="w-full py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary border border-primary/20">
              Platform Features
            </div>
            <h2 className="text-4xl font-black tracking-tight sm:text-6xl text-foreground">
              Everything you need to <span className="text-primary italic">thrive</span>
            </h2>
            <p className="max-w-[800px] text-text-muted md:text-xl font-medium">
              Ledgr combines advanced AI with powerful financial tools to give you total control 
              over your assets, from local bank accounts to global stock markets.
            </p>
          </div>
        </div>
        
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
          {features.map((feature) => (
            <div 
              key={feature.name} 
              className="group relative bg-surface/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-surface-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black text-foreground tracking-tight">{feature.name}</h3>
                  {feature.premium && (
                    <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-text-muted font-medium leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

