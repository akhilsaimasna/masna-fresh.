'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react';

export default function SignupPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
            // If email confirmation is disabled, redirect immediately
            setTimeout(() => {
                router.push('/dashboard');
                router.refresh();
            }, 1000);
        }
    };

    return (
        <div className="glass-card p-8">
            {/* Logo */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 mb-4">
                    <span className="text-2xl">🦾</span>
                </div>
                <h1 className="text-2xl font-bold gradient-text">Create Account</h1>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Start your job search journey
                </p>
            </div>

            {success ? (
                <div
                    className="p-4 rounded-lg text-center"
                    style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                    }}
                >
                    <p className="font-medium" style={{ color: 'var(--color-accent-400)' }}>
                        Account created! 🎉
                    </p>
                    <p
                        className="text-sm mt-1"
                        style={{ color: 'rgba(255,255,255,0.5)' }}
                    >
                        Redirecting to your dashboard...
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                    {error && (
                        <div
                            className="p-3 rounded-lg text-sm"
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                color: 'var(--color-danger-500)',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="fullName"
                            className="block text-xs font-medium mb-2"
                            style={{ color: 'rgba(255,255,255,0.5)' }}
                        >
                            Full Name
                        </label>
                        <div className="relative">
                            <User
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2"
                                style={{ color: 'rgba(255,255,255,0.3)' }}
                            />
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Jane Smith"
                                className="input-field pl-11"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-xs font-medium mb-2"
                            style={{ color: 'rgba(255,255,255,0.5)' }}
                        >
                            Email
                        </label>
                        <div className="relative">
                            <Mail
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2"
                                style={{ color: 'rgba(255,255,255,0.3)' }}
                            />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@university.edu"
                                className="input-field pl-11"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-xs font-medium mb-2"
                            style={{ color: 'rgba(255,255,255,0.5)' }}
                        >
                            Password
                        </label>
                        <div className="relative">
                            <Lock
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2"
                                style={{ color: 'rgba(255,255,255,0.3)' }}
                            />
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Min. 6 characters"
                                className="input-field pl-11"
                                minLength={6}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full mt-6"
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <UserPlus size={18} />
                        )}
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>
            )}

            <p
                className="text-center text-sm mt-6"
                style={{ color: 'rgba(255,255,255,0.4)' }}
            >
                Already have an account?{' '}
                <Link
                    href="/login"
                    className="font-medium"
                    style={{ color: 'var(--color-brand-400)' }}
                >
                    Sign in
                </Link>
            </p>
        </div>
    );
}
