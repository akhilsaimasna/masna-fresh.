'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    User,
    FileText,
    Briefcase,
    Star,
    ClipboardList,
    Settings,
    Bot,
} from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/agent', label: 'AI Agent', icon: Bot },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/resume', label: 'Resume', icon: FileText },
    { href: '/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/shortlist', label: 'Shortlist', icon: Star },
    { href: '/tracker', label: 'Tracker', icon: ClipboardList },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside
            className="fixed left-0 top-0 h-full flex flex-col py-6 px-4"
            style={{
                width: 240,
                background: 'rgba(2, 6, 23, 0.8)',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(20px)',
                zIndex: 40,
            }}
        >
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3 px-3 mb-8">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                        background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-500))',
                    }}
                >
                    <span className="text-lg">🦾</span>
                </div>
                <div>
                    <h1 className="text-sm font-bold gradient-text">OpenClaw</h1>
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        Job Apply Copilot
                    </p>
                </div>
            </Link>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-1">
                {navItems.map((item) => {
                    const isActive =
                        pathname === item.href || pathname.startsWith(item.href + '/');
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={18} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom section */}
            <div
                className="p-3 rounded-xl mt-auto"
                style={{
                    background: 'rgba(51, 128, 255, 0.05)',
                    border: '1px solid rgba(51, 128, 255, 0.1)',
                }}
            >
                <p className="text-xs font-medium" style={{ color: 'var(--color-brand-400)' }}>
                    Human-in-the-loop
                </p>
                <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    You review &amp; submit every application
                </p>
            </div>
        </aside>
    );
}
