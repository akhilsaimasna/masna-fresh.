'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const [userEmail, setUserEmail] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [showMenu, setShowMenu] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email ?? '');
                setUserName(user.user_metadata?.full_name ?? user.email ?? '');
            }
        };
        getUser();
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <header
            className="sticky top-0 flex items-center justify-between px-8 py-4"
            style={{
                background: 'rgba(2, 6, 23, 0.6)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(20px)',
                zIndex: 30,
            }}
        >
            <div />

            {/* User menu */}
            <div className="relative">
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:bg-white/5"
                >
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                            background: 'rgba(51, 128, 255, 0.15)',
                            border: '1px solid rgba(51, 128, 255, 0.2)',
                        }}
                    >
                        <User size={14} style={{ color: 'var(--color-brand-400)' }} />
                    </div>
                    <span
                        className="text-sm font-medium"
                        style={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                        {userName || 'User'}
                    </span>
                </button>

                {showMenu && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowMenu(false)}
                        />
                        <div
                            className="absolute right-0 top-full mt-2 w-56 py-2 rounded-xl z-50"
                            style={{
                                background: 'rgba(15, 23, 42, 0.95)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(20px)',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                            }}
                        >
                            <div className="px-4 py-2 mb-1">
                                <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {userName}
                                </p>
                                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                    {userEmail}
                                </p>
                            </div>
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-all hover:bg-white/5"
                                style={{ color: 'var(--color-danger-500)' }}
                            >
                                <LogOut size={14} />
                                Sign Out
                            </button>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}
