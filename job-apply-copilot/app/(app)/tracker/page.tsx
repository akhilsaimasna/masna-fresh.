'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/shared/Toast';
import Link from 'next/link';
import {
    Building2,
    MapPin,
    ExternalLink,
    ChevronDown,
    Bookmark,
    Send,
    MessageCircle,
    Gift,
    XCircle,
    FileText,
} from 'lucide-react';
import type { Application, Job } from '@/types/app.types';

const COLUMNS = [
    { id: 'saved', label: 'Saved', icon: Bookmark, color: 'rgba(51, 128, 255, 0.15)', textColor: 'var(--color-brand-400)' },
    { id: 'applied', label: 'Applied', icon: Send, color: 'rgba(245, 158, 11, 0.15)', textColor: 'var(--color-warning-500)' },
    { id: 'interview', label: 'Interview', icon: MessageCircle, color: 'rgba(16, 185, 129, 0.15)', textColor: 'var(--color-accent-400)' },
    { id: 'offered', label: 'Offered', icon: Gift, color: 'rgba(139, 92, 246, 0.15)', textColor: '#a78bfa' },
    { id: 'rejected', label: 'Rejected', icon: XCircle, color: 'rgba(239, 68, 68, 0.15)', textColor: 'var(--color-danger-500)' },
] as const;

export default function TrackerPage() {
    const [applications, setApplications] = useState<(Application & { job?: Job })[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const supabase = createClient();

    const fetchApplications = useCallback(async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('applications')
            .select('*, jobs(*)')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (data) {
            setApplications(
                data.map((app: Application & { jobs: Job }) => ({
                    ...app,
                    job: app.jobs,
                })) as unknown as (Application & { job?: Job })[]
            );
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const updateStatus = async (jobId: string, status: string) => {
        try {
            const response = await fetch('/api/applications/status', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId, status }),
            });
            if (!response.ok) throw new Error('Failed to update status');
            showToast(`Status updated to ${status}`);
            fetchApplications();
        } catch {
            showToast('Failed to update status', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="loading-spinner" style={{ width: 40, height: 40 }} />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Application Tracker</h1>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Track your application progress across all stages
                </p>
            </div>

            {applications.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <FileText size={40} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.2)' }} />
                    <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        No applications yet
                    </p>
                    <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        Generate application kits to start tracking
                    </p>
                    <Link href="/jobs" className="btn-ghost inline-flex">
                        Browse Jobs
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    {COLUMNS.map((column) => {
                        const columnApps = applications.filter((app) => app.status === column.id);
                        const Icon = column.icon;

                        return (
                            <div key={column.id} className="kanban-column p-4">
                                <div className="flex items-center gap-2 mb-4 px-1">
                                    <div
                                        className="w-6 h-6 rounded-md flex items-center justify-center"
                                        style={{ background: column.color, color: column.textColor }}
                                    >
                                        <Icon size={12} />
                                    </div>
                                    <span className="text-xs font-semibold" style={{ color: column.textColor }}>
                                        {column.label}
                                    </span>
                                    <span
                                        className="text-xs ml-auto px-2 py-0.5 rounded-full"
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'rgba(255,255,255,0.4)',
                                        }}
                                    >
                                        {columnApps.length}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    {columnApps.map((app) => (
                                        <TrackerCard
                                            key={app.id}
                                            application={app}
                                            currentStatus={column.id}
                                            onStatusChange={updateStatus}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function TrackerCard({
    application,
    currentStatus,
    onStatusChange,
}: {
    application: Application & { job?: Job };
    currentStatus: string;
    onStatusChange: (jobId: string, status: string) => void;
}) {
    const [showMenu, setShowMenu] = useState(false);

    const otherStatuses = COLUMNS.filter((c) => c.id !== currentStatus);

    return (
        <div
            className="p-3 rounded-xl relative group"
            style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255,255,255,0.06)',
            }}
        >
            <div className="flex items-center gap-2 mb-1">
                <Building2 size={10} style={{ color: 'var(--color-brand-400)' }} />
                <span className="text-[10px] font-medium" style={{ color: 'var(--color-brand-400)' }}>
                    {application.job?.company}
                </span>
            </div>
            <p className="text-xs font-medium mb-2 line-clamp-2">
                {application.job?.title}
            </p>
            {application.job?.location && (
                <span className="text-[10px] flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <MapPin size={8} /> {application.job.location}
                </span>
            )}

            <div className="flex items-center gap-1 mt-2">
                {application.kit_id && (
                    <Link
                        href={`/kit/${application.job_id}`}
                        className="text-[10px] px-2 py-0.5 rounded-md"
                        style={{
                            background: 'rgba(51, 128, 255, 0.1)',
                            color: 'var(--color-brand-400)',
                        }}
                    >
                        View Kit
                    </Link>
                )}
                <a
                    href={application.job?.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] px-2 py-0.5 rounded-md"
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        color: 'rgba(255,255,255,0.4)',
                    }}
                >
                    <ExternalLink size={8} className="inline mr-1" />
                    Apply
                </a>

                {/* Status dropdown */}
                <div className="relative ml-auto">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1"
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            color: 'rgba(255,255,255,0.4)',
                        }}
                    >
                        Move <ChevronDown size={8} />
                    </button>
                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                            <div
                                className="absolute right-0 bottom-full mb-1 w-32 py-1 rounded-lg z-50"
                                style={{
                                    background: 'rgba(15, 23, 42, 0.95)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(20px)',
                                }}
                            >
                                {otherStatuses.map((col) => (
                                    <button
                                        key={col.id}
                                        onClick={() => {
                                            onStatusChange(application.job_id, col.id);
                                            setShowMenu(false);
                                        }}
                                        className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-white/5 transition-colors"
                                        style={{ color: col.textColor }}
                                    >
                                        {col.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
