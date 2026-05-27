'use client';

/**
 * GoogleOAuthButton
 *
 * Renders a "Continue with Google" button.
 * When `configured` is false (default for MVP — Google OAuth credentials
 * not yet set up in Supabase), the button is visually present but disabled
 * with a tooltip explaining why.
 *
 * To enable:
 *  1. Add Google OAuth credentials in Supabase Auth dashboard
 *  2. Set NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true in .env.local
 */

import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface GoogleOAuthButtonProps {
    /** Set to true once Google OAuth is configured in Supabase Auth. Defaults to false. */
    configured?: boolean;
    redirectTo?: string;
}

// Google "G" SVG icon (official brand asset, no external CDN needed)
function GoogleIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
            />
            <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                fill="#34A853"
            />
            <path
                d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#FBBC05"
            />
            <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
            />
        </svg>
    );
}

export default function GoogleOAuthButton({
    configured = false,
    redirectTo = '/dashboard',
}: GoogleOAuthButtonProps) {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleGoogleSignIn = async () => {
        if (!configured) return;
        setLoading(true);
        try {
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
                },
            });
            // Note: browser will redirect; loading state persists intentionally
        } catch {
            setLoading(false);
        }
    };

    // When not configured, show disabled button with explanatory tooltip
    if (!configured) {
        return (
            <div className="relative group">
                <button
                    type="button"
                    disabled
                    aria-label="Continue with Google (not configured)"
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-medium cursor-not-allowed select-none"
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.25)',
                    }}
                >
                    <GoogleIcon />
                    Continue with Google
                </button>
                {/* Tooltip on hover */}
                <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50"
                    style={{
                        background: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.6)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    }}
                    role="tooltip"
                >
                    Google OAuth not configured yet
                </div>
            </div>
        );
    }

    // When configured, show active button
    return (
        <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all"
            style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.85)',
            }}
        >
            {loading ? (
                <Loader2 size={18} className="animate-spin" />
            ) : (
                <GoogleIcon />
            )}
            {loading ? 'Redirecting...' : 'Continue with Google'}
        </button>
    );
}
