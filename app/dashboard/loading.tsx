import { LoadingSpinner } from "@/components/theme/Loading";

export default function DashboardLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" label="Preparing your financial overview..." />
        </div>
    );
}
