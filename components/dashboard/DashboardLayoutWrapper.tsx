"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";
import { DashboardProvider, useDashboard } from "@/providers/dashboard-provider";
import { FullScreenLoader, LoadingSpinner } from "@/components/theme/Loading";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { loading, isSaving } = useDashboard();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <LoadingSpinner size="lg" label="Loading your dashboard..." />
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-background relative">
            {isSaving && <FullScreenLoader label="Saving changes..." />}
            
            <Sidebar isOpen={isSidebarOpen} onCloseAction={() => setIsSidebarOpen(false)} />
            
            <div className="flex-1 flex flex-col min-h-screen">
                <MobileHeader onOpenSidebarAction={() => setIsSidebarOpen(true)} />
                <main className="flex-1 px-4 py-8 md:p-8 lg:p-10 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

export function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <DashboardProvider>
            <DashboardLayoutContent>
                {children}
            </DashboardLayoutContent>
        </DashboardProvider>
    );
}
