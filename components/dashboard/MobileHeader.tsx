"use client";

import { Bars3Icon, ChartBarIcon } from "@heroicons/react/24/outline";

export function MobileHeader({ onOpenSidebarAction }: { onOpenSidebarAction: () => void }) {
    return (
        <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-surface/90 backdrop-blur-md border-b border-surface-border/50 sticky top-0 z-40">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary shadow-lg shadow-primary/30 rounded-xl flex items-center justify-center">
                    <ChartBarIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-black text-primary tracking-tighter">Ledgr</h2>
            </div>
            <button
                onClick={onOpenSidebarAction}
                className="p-2.5 text-foreground/80 hover:bg-primary/10 hover:text-primary rounded-xl transition-all active:scale-90"
                aria-label="Open Sidebar"
            >
                <Bars3Icon className="w-6 h-6" />
            </button>
        </header>
    );
}
