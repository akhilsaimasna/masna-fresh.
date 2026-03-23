'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    MapPin,
    Building2,
    ExternalLink,
    CheckCircle,
    XCircle,
    Zap,
    Wifi,
    Loader2,
} from 'lucide-react';
import { useToast } from '@/components/shared/Toast';
import type { Job, JobMatch } from '@/types/app.types';

export default function JobDetailPage() {
    const params = useParams();
    const jobId = params.jobId as string;
    const [job, setJob] = useState<Job | null>(null);
    const [match, setMatch] = useState<JobMatch | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const supabase = createClient();
    const { showToast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data: jobData } = await supabase
                .from('jobs')
                .select('*')
                .eq('id', jobId)
                .single();
            setJob(jobData);

            const { data: matchData } = await supabase
                .from('job_matches')
                .select('*')
                .eq('user_id', user.id)
                .eq('job_id', jobId)
                .single();
            setMatch(matchData);

            setLoading(false);
        };
        fetchData();
    }, [jobId, supabase]);

    const handleGenerateKit = async () => {
        setGenerating(true);
        try {
            const response = await fetch('/api/kit/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobIds: [jobId] }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            showToast('Application kit generated! 🎉');
            window.location.href = `/kit/${jobId}`;
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Generation failed', 'error');
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

    if (!job) {
        return (
            <div className="text-center py-20">
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>Job not found</p>
                <Link href="/jobs" className="btn-ghost mt-4 inline-flex">
                    <ArrowLeft size={16} /> Back to Jobs
                </Link>
            </div>
        );
    }

    const scoreClass =
        (match?.match_score || 0) >= 80
            ? 'score-high'
            : (match?.match_score || 0) >= 60
                ? 'score-medium'
                : 'score-low';

    return (
        <div className="max-w-4xl">
            <Link
                href="/jobs"
                className="inline-flex items-center gap-2 text-sm mb-6"
                style={{ color: 'rgba(255,255,255,0.4)' }}
            >
                <ArrowLeft size={14} /> Back to Jobs
            </Link>

            {/* Job Header */}
            <div className="glass-card p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Building2 size={16} style={{ color: 'var(--color-brand-400)' }} />
                            <span className="text-sm font-medium" style={{ color: 'var(--color-brand-400)' }}>
                                {job.company}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold mb-3">{job.title}</h1>
                        <div className="flex flex-wrap gap-2">
                            {job.location && (
                                <span className="chip chip-neutral">
                                    <MapPin size={12} /> {job.location}
                                </span>
                            )}
                            {job.remote_type && (
                                <span className="chip chip-brand">
                                    <Wifi size={12} /> {job.remote_type}
                                </span>
                            )}
                            <span className="chip chip-neutral">
                                via {job.source}
                            </span>
                        </div>
                    </div>

                    {match && (
                        <div className="text-center">
                            <div className={`score-badge ${scoreClass}`} style={{ width: 64, height: 64, fontSize: 22 }}>
                                {match.match_score}
                            </div>
                            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                Match
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-5">
                    <a
                        href={job.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost"
                    >
                        <ExternalLink size={16} /> View Original Posting
                    </a>
                    <button onClick={handleGenerateKit} disabled={generating} className="btn-primary">
                        {generating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                        {generating ? 'Generating Kit...' : 'Generate Application Kit'}
                    </button>
                </div>
            </div>

            {/* Match Breakdown */}
            {match && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="glass-card p-5">
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <CheckCircle size={16} style={{ color: 'var(--color-accent-400)' }} />
                            <span style={{ color: 'var(--color-accent-400)' }}>Matched Skills</span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {match.matched_skills?.map((skill) => (
                                <span key={skill} className="chip chip-accent">
                                    {skill}
                                </span>
                            ))}
                            {(!match.matched_skills || match.matched_skills.length === 0) && (
                                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                    No matched skills found
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="glass-card p-5">
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <XCircle size={16} style={{ color: 'var(--color-danger-500)' }} />
                            <span style={{ color: 'var(--color-danger-500)' }}>Missing Skills</span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {match.missing_skills?.map((skill) => (
                                <span key={skill} className="chip chip-danger">
                                    {skill}
                                </span>
                            ))}
                            {(!match.missing_skills || match.missing_skills.length === 0) && (
                                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                    No gaps identified!
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* AI Reasoning */}
            {match?.match_reasoning && (
                <div className="glass-card p-5 mb-6">
                    <h3 className="text-sm font-semibold mb-2">AI Analysis</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        {match.match_reasoning}
                    </p>
                </div>
            )}

            {/* Job Description */}
            <div className="glass-card p-6">
                <h3 className="text-sm font-semibold mb-4">Job Description</h3>
                <div
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                    {job.description || 'No description available'}
                </div>
            </div>
        </div>
    );
}
