"use client";

import { Bars3Icon, ChartBarIcon } from "@heroicons/react/24/outline";

export function MobileHeader({ onOpenSidebarAction }: { onOpenSidebarAction: () => void }) {
    return (
        <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-surface border-b border-surface-border sticky top-0 z-40">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-extrabold text-primary tracking-tight">Ledgr</h2>
            </div>
            <button
                onClick={onOpenSidebarAction}
                className="p-2 text-foreground/80 hover:bg-link-hover-bg rounded-lg transition-colors"
                aria-label="Open Sidebar"
            >
                <Bars3Icon className="w-6 h-6" />
            </button>
        </header>
    );
}
