'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/shared/Toast';
import Link from 'next/link';
import { Star, Loader2, Zap, Building2, MapPin, Trash2 } from 'lucide-react';
import type { Job, JobMatch } from '@/types/app.types';

export default function ShortlistPage() {
    const [selected, setSelected] = useState<(JobMatch & { job: Job })[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const { showToast } = useToast();
    const supabase = createClient();

    useEffect(() => {
        const fetchMatches = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            // Get top matches that don't have kits generated yet
            const { data: matches } = await supabase
                .from('job_matches')
                .select('*, jobs(*)')
                .eq('user_id', user.id)
                .order('match_score', { ascending: false });

            if (matches) {
                // Check which have kits
                const { data: kits } = await supabase
                    .from('application_kits')
                    .select('job_id')
                    .eq('user_id', user.id);

                const kitJobIds = new Set((kits || []).map((k: { job_id: string }) => k.job_id));

                const withoutKits = matches
                    .filter((m: JobMatch & { jobs: Job }) => !kitJobIds.has(m.job_id))
                    .map((m: JobMatch & { jobs: Job }) => ({
                        ...m,
                        job: m.jobs,
                    }));

                setSelected(withoutKits as unknown as (JobMatch & { job: Job })[]);
            }

            setLoading(false);
        };
        fetchMatches();
    }, [supabase]);

    const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

    const toggleCheck = (jobId: string) => {
        const newSet = new Set(checkedIds);
        if (newSet.has(jobId)) {
            newSet.delete(jobId);
        } else {
            if (newSet.size >= 5) {
                showToast('Maximum 5 kits can be generated at once', 'info');
                return;
            }
            newSet.add(jobId);
        }
        setCheckedIds(newSet);
    };

    const handleGenerate = async () => {
        if (checkedIds.size === 0) {
            showToast('Select at least one job', 'error');
            return;
        }

        setGenerating(true);
        try {
            const response = await fetch('/api/kit/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobIds: Array.from(checkedIds) }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            showToast(`Generated ${data.count} application kits! 🎉`);
            // Refresh
            setSelected(selected.filter((s) => !checkedIds.has(s.job_id)));
            setCheckedIds(new Set());
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Generation failed', 'error');
        } finally {
            setGenerating(false);
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
        <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Shortlist</h1>
                    <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Select jobs to generate application kits (max 5 at a time)
                    </p>
                </div>
                {checkedIds.size > 0 && (
                    <button onClick={handleGenerate} disabled={generating} className="btn-primary">
                        {generating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                        Generate {checkedIds.size} Kit{checkedIds.size > 1 ? 's' : ''}
                    </button>
                )}
            </div>

            {selected.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Star size={40} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.2)' }} />
                    <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        No unprocessed matches
                    </p>
                    <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        Discover and match jobs first, then come back to shortlist
                    </p>
                    <Link href="/jobs" className="btn-ghost inline-flex">
                        Browse Jobs
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {selected.map((item) => {
                        const isChecked = checkedIds.has(item.job_id);
                        const scoreClass =
                            (item.match_score || 0) >= 80
                                ? 'score-high'
                                : (item.match_score || 0) >= 60
                                    ? 'score-medium'
                                    : 'score-low';

                        return (
                            <div
                                key={item.id}
                                onClick={() => toggleCheck(item.job_id)}
                                className="glass-card p-5 cursor-pointer transition-all"
                                style={{
                                    borderColor: isChecked ? 'rgba(51, 128, 255, 0.3)' : undefined,
                                    background: isChecked ? 'rgba(51, 128, 255, 0.05)' : undefined,
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
                                        style={{
                                            background: isChecked ? 'var(--color-brand-500)' : 'rgba(255,255,255,0.05)',
                                            border: `2px solid ${isChecked ? 'var(--color-brand-500)' : 'rgba(255,255,255,0.15)'}`,
                                        }}
                                    >
                                        {isChecked && <span className="text-white text-xs">✓</span>}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Building2 size={12} style={{ color: 'var(--color-brand-400)' }} />
                                            <span className="text-xs" style={{ color: 'var(--color-brand-400)' }}>
                                                {item.job?.company}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-semibold">{item.job?.title}</h3>
                                        {item.job?.location && (
                                            <span className="text-xs flex items-center gap-1 mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                                <MapPin size={10} /> {item.job.location}
                                            </span>
                                        )}
                                    </div>

                                    <div className={`score-badge ${scoreClass}`}>
                                        {item.match_score}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
