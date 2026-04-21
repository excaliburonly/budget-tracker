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
    PresentationChartLineIcon,
    ShieldCheckIcon,
    ArrowRightStartOnRectangleIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";

import { useState, useMemo } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { useDashboard } from "@/providers/dashboard-provider";

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Accounts', href: '/dashboard/accounts', icon: BanknotesIcon },
    { name: 'Transactions', href: '/dashboard/transactions', icon: ArrowsRightLeftIcon },
    { name: 'Analytics', href: '/dashboard/analytics', icon: PresentationChartLineIcon },
    { name: 'Budgets', href: '/dashboard/budgets', icon: ChartPieIcon },
    { name: 'Investments', href: '/dashboard/investments', icon: ChartBarIcon, hasDropdown: true, dropdownType: 'investments' },
    { name: 'Emergency Funds', href: '/dashboard/emergency-funds', icon: ShieldCheckIcon, hasDropdown: true, dropdownType: 'emergency-funds' },
];

function SidebarContent({ pathname, onCloseAction }: { pathname: string | null; onCloseAction?: () => void }) {
    const { investments } = useDashboard();
    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
        'investments': pathname?.startsWith('/dashboard/investments') || false,
        'emergency-funds': pathname?.startsWith('/dashboard/emergency-funds') || false
    });

    const toggleDropdown = (type: string) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    const investmentItems = useMemo(() => {
        const types = Array.from(new Set(investments.map(inv => inv.investment_type)));
        const items = types.sort().map(type => ({
            name: type,
            href: `/dashboard/investments/${type.toLowerCase().replace(/\s+/g, '-')}`
        }));
        
        return [
            { name: 'Transactions', href: '/dashboard/investments/transactions' },
            ...items
        ];
    }, [investments]);

    const emergencyFundItems = useMemo(() => {
        return [
            { name: 'Transactions', href: '/dashboard/emergency-funds/transactions' }
        ];
    }, []);

    const getDropdownItems = (type: string) => {
        if (type === 'investments') return investmentItems;
        if (type === 'emergency-funds') return emergencyFundItems;
        return [];
    };

    return (
        <>
            <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-primary shadow-lg shadow-primary/30 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12">
                        <Logo size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-primary tracking-tighter">Ledgr</h2>
                </div>
                {onCloseAction && (
                    <button onClick={onCloseAction} className="lg:hidden p-2.5 text-text-muted hover:bg-primary/10 hover:text-primary rounded-xl transition-all">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                )}
            </div>

            <nav className="flex-1 px-4 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.hasDropdown && pathname?.startsWith(item.href));
                    const isExactActive = pathname === item.href;
                    const Icon = item.icon;
                    
                    if (item.hasDropdown) {
                        return (
                            <div key={item.name} className="flex flex-col gap-1">
                                <div className="flex items-center gap-1">
                                    <Link
                                        href={item.href}
                                        onClick={onCloseAction}
                                        className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm ${
                                            isExactActive
                                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                                : isActive 
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-foreground/70 hover:bg-primary/5 hover:text-primary'
                                        }`}
                                    >
                                        <Icon className={`w-5 h-5 ${isExactActive ? 'text-white' : ''}`} />
                                        {item.name}
                                    </Link>
                                    <button 
                                        onClick={() => toggleDropdown(item.dropdownType!)}
                                        className={`p-2.5 rounded-xl transition-colors ${
                                            isActive ? 'text-primary' : 'text-text-muted hover:bg-primary/5 hover:text-primary'
                                        }`}
                                    >
                                        {openDropdowns[item.dropdownType!] ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                                    </button>
                                </div>
                                {openDropdowns[item.dropdownType!] && (
                                    <div className="ml-10 flex flex-col gap-1 mb-2 border-l-2 border-primary/20 pl-4 py-1 animate-in fade-in slide-in-from-left-2 duration-300">
                                        {getDropdownItems(item.dropdownType!).map((subItem) => {
                                            const isSubActive = pathname === subItem.href;
                                            return (
                                                <Link
                                                    key={subItem.name}
                                                    href={subItem.href}
                                                    onClick={onCloseAction}
                                                    className={`px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                                                        isSubActive
                                                            ? 'text-primary bg-primary/10'
                                                            : 'text-text-muted hover:text-primary hover:bg-primary/5'
                                                    }`}
                                                >
                                                    {subItem.name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onCloseAction}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm ${
                                isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'text-foreground/70 hover:bg-primary/5 hover:text-primary'
                            }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-sidebar-border/50 flex flex-col gap-3 bg-sidebar/50 backdrop-blur-sm mt-auto">
                <div className="bg-background/50 p-1.5 rounded-2xl border border-sidebar-border/30">
                    <ThemeToggle align="top" showLabelOnMobile={true} />
                </div>
                <form action={signOut}>
                    <button className="flex items-center gap-3 w-full px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all active:scale-95">
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
