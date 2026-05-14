import { LoadingSpinner } from "@/components/theme/Loading";

export default function AnalyticsLoading() {
    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
            <header>
                <div className="h-10 w-64 bg-surface animate-pulse rounded-xl mb-2" />
                <div className="h-4 w-96 bg-surface animate-pulse rounded-lg" />
            </header>

            <div className="flex flex-wrap items-center gap-2 bg-surface/50 p-2 rounded-[2rem] border border-surface-border/50 w-fit mb-8">
                <div className="h-12 w-32 bg-surface animate-pulse rounded-[1.5rem]" />
                <div className="h-12 w-32 bg-surface animate-pulse rounded-[1.5rem]" />
                <div className="h-12 w-32 bg-surface animate-pulse rounded-[1.5rem]" />
            </div>

            <div className="flex flex-col items-center justify-center py-20">
                <LoadingSpinner size="lg" label="Analyzing your financial data..." />
            </div>
        </div>
    );
}
