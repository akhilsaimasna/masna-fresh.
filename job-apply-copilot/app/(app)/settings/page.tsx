'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/shared/Toast';
import { Trash2, AlertTriangle, Loader2, Shield } from 'lucide-react';

export default function SettingsPage() {
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const { showToast } = useToast();
    const router = useRouter();
    const supabase = createClient();

    const handleDeleteAccount = async () => {
        if (confirmText !== 'DELETE') {
            showToast('Please type DELETE to confirm', 'error');
            return;
        }

        setDeleting(true);
        try {
            const response = await fetch('/api/account/delete', { method: 'DELETE' });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Deletion failed');
            }

            await supabase.auth.signOut();
            showToast('Account deleted successfully');
            router.push('/login');
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Deletion failed', 'error');
            setDeleting(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Manage your account
                </p>
            </div>

            {/* Data Privacy */}
            <div className="glass-card p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.15)',
                        }}
                    >
                        <Shield size={20} style={{ color: 'var(--color-accent-400)' }} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold">Data Privacy</h2>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            Your data is protected with Row-Level Security
                        </p>
                    </div>
                </div>
                <ul className="space-y-2 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <li className="flex items-center gap-2">
                        <span style={{ color: 'var(--color-accent-400)' }}>✓</span>
                        No other user can see your resumes, matches, or application data
                    </li>
                    <li className="flex items-center gap-2">
                        <span style={{ color: 'var(--color-accent-400)' }}>✓</span>
                        We never automate submissions to LinkedIn, Indeed, or any ATS
                    </li>
                    <li className="flex items-center gap-2">
                        <span style={{ color: 'var(--color-accent-400)' }}>✓</span>
                        Only public job feeds (Greenhouse, Lever) are accessed
                    </li>
                    <li className="flex items-center gap-2">
                        <span style={{ color: 'var(--color-accent-400)' }}>✓</span>
                        You can delete all your data at any time
                    </li>
                </ul>
            </div>

            {/* Danger Zone */}
            <div
                className="p-6 rounded-2xl"
                style={{
                    background: 'rgba(239, 68, 68, 0.03)',
                    border: '1px solid rgba(239, 68, 68, 0.1)',
                }}
            >
                <h2
                    className="text-sm font-semibold mb-2 flex items-center gap-2"
                    style={{ color: 'var(--color-danger-500)' }}
                >
                    <AlertTriangle size={16} />
                    Danger Zone
                </h2>
                <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Deleting your account will permanently remove all your data including resumes,
                    analyses, job matches, application kits, and tracker history. This action cannot
                    be undone.
                </p>

                {!showConfirm ? (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="btn-danger"
                    >
                        <Trash2 size={16} />
                        Delete My Account
                    </button>
                ) : (
                    <div
                        className="p-4 rounded-xl"
                        style={{
                            background: 'rgba(239, 68, 68, 0.05)',
                            border: '1px solid rgba(239, 68, 68, 0.15)',
                        }}
                    >
                        <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-danger-500)' }}>
                            Type DELETE to confirm:
                        </p>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="input-field mb-3"
                            placeholder="Type DELETE"
                            style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleting || confirmText !== 'DELETE'}
                                className="btn-danger"
                            >
                                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                {deleting ? 'Deleting...' : 'Permanently Delete'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirm(false);
                                    setConfirmText('');
                                }}
                                className="btn-ghost"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
