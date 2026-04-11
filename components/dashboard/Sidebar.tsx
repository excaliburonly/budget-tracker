"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Logo } from "@/components/brand/Logo";
import {
    HomeIcon,
    BanknotesIcon,
    ArrowsRightLeftIcon,
    ChartBarIcon,
    ChartPieIcon,
    ShieldCheckIcon,
    ArrowRightStartOnRectangleIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Accounts', href: '/dashboard/accounts', icon: BanknotesIcon },
    { name: 'Transactions', href: '/dashboard/transactions', icon: ArrowsRightLeftIcon },
    { name: 'Budgets', href: '/dashboard/budgets', icon: ChartPieIcon },
    { name: 'Investments', href: '/dashboard/investments', icon: ChartBarIcon },
    { name: 'Emergency Funds', href: '/dashboard/emergency-funds', icon: ShieldCheckIcon },
];

function SidebarContent({ pathname, onCloseAction }: { pathname: string | null; onCloseAction?: () => void }) {
    return (
        <>
            <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Logo size={32} />
                    <h2 className="text-2xl font-extrabold text-primary tracking-tight">Ledgr</h2>
                </div>
                {onCloseAction && (
                    <button onClick={onCloseAction} className="lg:hidden p-2 text-text-muted hover:bg-link-hover-bg rounded-lg">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                )}
            </div>

            <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onCloseAction}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${
                                isActive
                                    ? 'bg-primary text-white'
                                    : 'text-foreground/80 hover:bg-link-hover-bg hover:text-link-hover-text'
                            }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-sidebar-border flex flex-col gap-2 bg-sidebar mt-auto">
                <ThemeToggle align="top" showLabelOnMobile={true} />
                <form action={signOut}>
                    <button className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm font-medium text-text-muted hover:text-red-600 hover:bg-red-50/10 rounded-lg transition-colors">
                        <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
                        Sign Out
                    </button>
                </form>
            </div>
        </>
    );
}

export function Sidebar({ isOpen, onCloseAction }: { isOpen?: boolean; onCloseAction?: () => void }) {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 bg-sidebar border-r border-sidebar-border flex-col sticky top-0 h-screen">
                <SidebarContent pathname={pathname} />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onCloseAction}
            />

            {/* Mobile Sidebar Drawer */}
            <aside
                className={`fixed inset-y-0 left-0 w-72 bg-sidebar z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } flex flex-col shadow-2xl`}
            >
                <SidebarContent pathname={pathname} onCloseAction={onCloseAction} />
            </aside>
        </>
    );
}
