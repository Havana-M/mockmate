"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Mic2,
    Code2,
    FileText,
    BookOpen,
    CircleHelp,
    Target,
    CodeXml,
    NotebookPen,
    BarChart3,
    ClipboardList,
    Trophy,
    Settings,
    LifeBuoy,
    LogOut,
    Menu,
    X,
    Bot,
} from "lucide-react";

interface AppShellProps {
    children: React.ReactNode;
}

type NavItem = {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
};

const mainItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Mock Interviews", href: "/interview", icon: Mic2 },
    { label: "Code Playground", href: "/playground", icon: Code2 },
    { label: "My Resume", href: "/resume", icon: FileText },
];

const prepareItems: NavItem[] = [
    { label: "Interview Prep", href: "/prep", icon: BookOpen },
    { label: "Question Bank", href: "/questions", icon: CircleHelp },
    { label: "Weak Areas", href: "/weak-areas", icon: Target },
];

const mySpaceItems: NavItem[] = [
    { label: "Code Snippets", href: "/snippets", icon: CodeXml },
    { label: "My Notes", href: "/notes", icon: NotebookPen },
];

const performanceItems: NavItem[] = [
    { label: "Progress", href: "/progress", icon: BarChart3 },
    { label: "Interview Reports", href: "/reports", icon: ClipboardList },
    { label: "Achievements", href: "/achievements", icon: Trophy },
];

const utilityItems: NavItem[] = [
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Help & Support", href: "/help", icon: LifeBuoy },
];

function SidebarLink({
    item,
    onClick,
}: {
    item: NavItem;
    onClick?: () => void;
}) {
    const pathname = usePathname();

    const isActive =
        pathname === item.href ||
        (item.href !== "/dashboard" &&
            pathname.startsWith(`${item.href}/`));

    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            onClick={onClick}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                    ? "border border-slate-600 bg-slate-800 text-white shadow-[0_8px_24px_rgba(15,23,42,0.25)]"
                    : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                }`}
        >
            <Icon
                className={`h-4.5 w-4.5 flex-shrink-0 transition-colors ${isActive
                        ? "text-slate-200"
                        : "text-slate-500 group-hover:text-slate-300"
                    }`}
            />

            <span>{item.label}</span>
        </Link>
    );
}

function SidebarSection({
    title,
    items,
    onClick,
}: {
    title: string;
    items: NavItem[];
    onClick?: () => void;
}) {
    return (
        <div className="mb-5">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                {title}
            </p>

            <div className="space-y-1">
                {items.map((item) => (
                    <SidebarLink
                        key={item.href}
                        item={item}
                        onClick={onClick}
                    />
                ))}
            </div>
        </div>
    );
}

export default function AppShell({
    children,
}: AppShellProps) {
    const router = useRouter();

    const [mobileOpen, setMobileOpen] =
        React.useState(false);

    const handleLogout = () => {
        localStorage.removeItem("mockmate_token");
        localStorage.removeItem("mockmate_user");

        setMobileOpen(false);
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-[#F1F5F9] text-slate-900">

            {/* Mobile top bar */}
            <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-700 bg-[#0F172A] px-4 lg:hidden">

                <Link
                    href="/dashboard"
                    className="flex items-center gap-3"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1E3A5F] shadow-lg">
                        <Bot className="h-5 w-5 text-white" />
                    </div>

                    <div>
                        <p className="text-sm font-bold text-white">
                            Mock<span className="text-slate-300">Mate</span>
                        </p>

                        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                            AI Interviewer
                        </p>
                    </div>
                </Link>

                <button
                    type="button"
                    onClick={() =>
                        setMobileOpen((value) => !value)
                    }
                    className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
                    aria-label="Toggle navigation"
                >
                    {mobileOpen ? (
                        <X className="h-5 w-5" />
                    ) : (
                        <Menu className="h-5 w-5" />
                    )}
                </button>
            </div>

            {/* Mobile sidebar */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                >
                    <aside
                        className="h-full w-[285px] overflow-y-auto border-r border-slate-700 bg-[#0F172A] p-4 shadow-2xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="mb-6 flex items-center justify-between">

                            <Link
                                href="/dashboard"
                                onClick={() =>
                                    setMobileOpen(false)
                                }
                                className="flex items-center gap-3"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E3A5F]">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>

                                <div>
                                    <p className="font-bold text-white">
                                        Mock<span className="text-slate-300">Mate</span>
                                    </p>

                                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                                        AI Interviewer
                                    </p>
                                </div>
                            </Link>

                            <button
                                type="button"
                                onClick={() =>
                                    setMobileOpen(false)
                                }
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <SidebarSection
                            title="Main"
                            items={mainItems}
                            onClick={() =>
                                setMobileOpen(false)
                            }
                        />

                        <SidebarSection
                            title="Prepare"
                            items={prepareItems}
                            onClick={() =>
                                setMobileOpen(false)
                            }
                        />

                        <SidebarSection
                            title="My Space"
                            items={mySpaceItems}
                            onClick={() =>
                                setMobileOpen(false)
                            }
                        />

                        <SidebarSection
                            title="Performance"
                            items={performanceItems}
                            onClick={() =>
                                setMobileOpen(false)
                            }
                        />

                        <SidebarSection
                            title="Support"
                            items={utilityItems}
                            onClick={() =>
                                setMobileOpen(false)
                            }
                        />

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                        >
                            <LogOut className="h-4.5 w-4.5" />
                            <span>Logout</span>
                        </button>
                    </aside>
                </div>
            )}

            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-[270px] border-r border-slate-700 bg-[#0F172A] lg:flex lg:flex-col">

                {/* Logo */}
                <div className="border-b border-slate-700 px-5 py-5">

                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3"
                    >
                        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1E3A5F] shadow-lg">
                            <Bot className="h-6 w-6 text-white" />
                        </div>

                        <div>
                            <p className="text-lg font-extrabold tracking-tight text-white">
                                Mock<span className="text-slate-300">Mate</span>
                            </p>

                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                AI Interviewer
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-4 py-5">

                    <SidebarSection
                        title="Main"
                        items={mainItems}
                    />

                    <SidebarSection
                        title="Prepare"
                        items={prepareItems}
                    />

                    <SidebarSection
                        title="My Space"
                        items={mySpaceItems}
                    />

                    <SidebarSection
                        title="Performance"
                        items={performanceItems}
                    />

                    <SidebarSection
                        title="Support"
                        items={utilityItems}
                    />
                </div>

                {/* User / logout */}
                <div className="border-t border-slate-700 p-4">

                    <div className="mb-3 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/60 p-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E3A5F] text-xs font-bold text-white">
                            M
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-200">
                                MockMate User
                            </p>

                            <p className="text-xs text-slate-400">
                                Candidate
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                    >
                        <LogOut className="h-4.5 w-4.5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-[270px]">
                <main className="min-h-screen">
                    {children}
                </main>
            </div>
        </div>
    );
}