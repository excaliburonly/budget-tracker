import { LoadingSpinner } from "@/components/theme/Loading";

export default function ProfileLoading() {
    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col gap-2">
                <div className="h-10 w-64 bg-surface animate-pulse rounded-xl mb-2" />
                <div className="h-4 w-96 bg-surface animate-pulse rounded-lg" />
            </div>

            <div className="bg-surface/80 p-8 rounded-[2.5rem] border border-surface-border/50">
                <div className="flex flex-col items-center justify-center py-10">
                    <LoadingSpinner label="Loading your profile..." />
                </div>
            </div>
        </div>
    );
}
