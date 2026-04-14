'use client';

import { useState, useRef, useCallback } from 'react';
import {
    Bot,
    Play,
    Square,
    CheckCircle2,
    XCircle,
    ExternalLink,
    MapPin,
    Building2,
    Wifi,
    ChevronDown,
    ChevronUp,
    Loader2,
    AlertTriangle,
    Send,
} from 'lucide-react';
import type { Job, JobMatch } from '@/types/app.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AgentStep {
    id: number;
    message: string;
    type: 'info' | 'error';
    time: string;
}

interface DiscoveredJob {
    job: Job;
    match: JobMatch;
    status: 'pending' | 'applying' | 'applied' | 'skipped';
}

interface ConfirmJob {
    job: Job;
    match: JobMatch;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
    if (score >= 80) return 'var(--color-accent-400)';
    if (score >= 60) return 'var(--color-warning-500)';
    return 'rgba(255,255,255,0.4)';
}

function scoreBg(score: number) {
    if (score >= 80) return 'rgba(16,185,129,0.1)';
    if (score >= 60) return 'rgba(245,158,11,0.1)';
    return 'rgba(255,255,255,0.05)';
}

function now() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ─── Confirmation Modal ───────────────────────────────────────────────────────

function ConfirmModal({
    item,
    onConfirm,
    onSkip,
    applying,
}: {
    item: ConfirmJob;
    onConfirm: () => void;
    onSkip: () => void;
    applying: boolean;
}) {
    const { job, match } = item;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(1,3,20,0.85)', backdropFilter: 'blur(8px)' }}
        >
            <div
                className="w-full max-w-lg glass-card p-6"
                style={{ border: '1px solid rgba(51,128,255,0.3)', boxShadow: '0 0 60px rgba(51,128,255,0.15)' }}
            >
                {/* Header */}
                <div className="flex items-start gap-4 mb-5">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(51,128,255,0.1)', border: '1px solid rgba(51,128,255,0.2)' }}
                    >
                        <Building2 size={22} style={{ color: 'var(--color-brand-400)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-brand-400)' }}>
                            {job.company}
                        </p>
                        <h2 className="text-base font-bold leading-tight">{job.title}</h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {job.location && (
                                <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                    <MapPin size={11} /> {job.location}
                                </span>
                            )}
                            {job.remote_type && (
                                <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                    <Wifi size={11} /> {job.remote_type}
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Score badge */}
                    <div
                        className="px-3 py-1 rounded-lg text-sm font-bold shrink-0"
                        style={{ background: scoreBg(match.match_score), color: scoreColor(match.match_score) }}
                    >
                        {match.match_score}%
                    </div>
                </div>

                {/* Match reasoning */}
                {match.match_reasoning && (
                    <div
                        className="p-3 rounded-xl mb-4 text-xs leading-relaxed"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                    >
                        {match.match_reasoning}
                    </div>
                )}

                {/* Skills */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-accent-400)' }}>
                            Matched Skills
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {(match.matched_skills || []).slice(0, 6).map((s) => (
                                <span key={s} className="chip chip-accent text-[10px]">{s}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(239,68,68,0.8)' }}>
                            Gaps
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {(match.missing_skills || []).slice(0, 4).map((s) => (
                                <span
                                    key={s}
                                    className="chip text-[10px]"
                                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: 'rgba(239,68,68,0.7)' }}
                                >
                                    {s}
                                </span>
                            ))}
                            {(match.missing_skills || []).length === 0 && (
                                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>None</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Warning */}
                <div
                    className="flex items-start gap-2 p-3 rounded-xl mb-5"
                    style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
                >
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--color-warning-500)' }} />
                    <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        The agent will open the application link. You control the final submit — this keeps you safe from being flagged by job boards.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onSkip}
                        disabled={applying}
                        className="btn-ghost flex-1"
                        style={{ opacity: applying ? 0.5 : 1 }}
                    >
                        <XCircle size={16} /> Skip
                    </button>
                    <a
                        href={job.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost"
                        style={{ padding: '0 12px' }}
                        title="Open job posting"
                    >
                        <ExternalLink size={16} />
                    </a>
                    <button
                        onClick={onConfirm}
                        disabled={applying}
                        className="btn-primary flex-1"
                    >
                        {applying ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Send size={16} />
                        )}
                        {applying ? 'Applying...' : 'Confirm & Apply'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Job Result Card ──────────────────────────────────────────────────────────

function JobResultCard({
    item,
    onReview,
}: {
    item: DiscoveredJob;
    onReview: () => void;
}) {
    const { job, match, status } = item;
    const [expanded, setExpanded] = useState(false);

    const statusConfig = {
        pending: { label: 'Review', color: 'var(--color-brand-400)', bg: 'rgba(51,128,255,0.1)', showBtn: true },
        applying: { label: 'Applying...', color: 'var(--color-warning-500)', bg: 'rgba(245,158,11,0.1)', showBtn: false },
        applied: { label: 'Applied', color: 'var(--color-accent-400)', bg: 'rgba(16,185,129,0.1)', showBtn: false },
        skipped: { label: 'Skipped', color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.04)', showBtn: false },
    };

    const cfg = statusConfig[status];

    return (
        <div
            className="glass-card p-4"
            style={{
                borderColor: status === 'applied' ? 'rgba(16,185,129,0.2)' : status === 'skipped' ? 'transparent' : undefined,
                opacity: status === 'skipped' ? 0.5 : 1,
            }}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                    <Building2 size={15} style={{ color: 'rgba(255,255,255,0.4)' }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium" style={{ color: 'var(--color-brand-400)' }}>{job.company}</p>
                    <p className="text-sm font-semibold truncate">{job.title}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {job.location && (
                            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                <MapPin size={9} /> {job.location}
                            </span>
                        )}
                        {job.remote_type && (
                            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                <Wifi size={9} /> {job.remote_type}
                            </span>
                        )}
                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{job.source}</span>
                    </div>
                </div>

                {/* Score + status */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <div
                        className="px-2 py-0.5 rounded-lg text-xs font-bold"
                        style={{ background: scoreBg(match.match_score), color: scoreColor(match.match_score) }}
                    >
                        {match.match_score}%
                    </div>
                    {cfg.showBtn ? (
                        <button
                            onClick={onReview}
                            className="text-[10px] font-semibold px-3 py-1 rounded-lg transition-all"
                            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}
                        >
                            {cfg.label}
                        </button>
                    ) : (
                        <span
                            className="text-[10px] font-semibold px-3 py-1 rounded-lg"
                            style={{ background: cfg.bg, color: cfg.color }}
                        >
                            {cfg.label}
                        </span>
                    )}
                </div>
            </div>

            {/* Expand matched skills */}
            {match.matched_skills?.length > 0 && (
                <div className="mt-3">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-1 text-[10px]"
                        style={{ color: 'rgba(255,255,255,0.3)' }}
                    >
                        {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                        {match.matched_skills.length} matched skills
                    </button>
                    {expanded && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {match.matched_skills.map((s) => (
                                <span key={s} className="chip chip-accent text-[10px]">{s}</span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Main Agent Page ──────────────────────────────────────────────────────────

export default function AgentPage() {
    const [running, setRunning] = useState(false);
    const [done, setDone] = useState(false);
    const [steps, setSteps] = useState<AgentStep[]>([]);
    const [jobs, setJobs] = useState<DiscoveredJob[]>([]);
    const [confirmJob, setConfirmJob] = useState<ConfirmJob | null>(null);
    const [applying, setApplying] = useState(false);
    const [keywords, setKeywords] = useState('');
    const eventSourceRef = useRef<EventSource | null>(null);
    const stepIdRef = useRef(0);
    const logRef = useRef<HTMLDivElement>(null);

    const addStep = useCallback((message: string, type: 'info' | 'error' = 'info') => {
        setSteps((prev) => [
            ...prev,
            { id: stepIdRef.current++, message, type, time: now() },
        ]);
        setTimeout(() => {
            logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
        }, 50);
    }, []);

    const startAgent = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        setRunning(true);
        setDone(false);
        setSteps([]);
        setJobs([]);

        const params = new URLSearchParams();
        if (keywords.trim()) {
            params.set('keywords', keywords);
        }

        const url = `/api/agent/run${params.toString() ? `?${params}` : ''}`;
        const es = new EventSource(url);
        eventSourceRef.current = es;

        es.onmessage = (e) => {
            const data = JSON.parse(e.data);

            if (data.type === 'step') {
                addStep(data.message);
            } else if (data.type === 'error') {
                addStep(data.message, 'error');
                setRunning(false);
                es.close();
            } else if (data.type === 'job') {
                setJobs((prev) => {
                    // avoid duplicates
                    if (prev.some((j) => j.job.id === data.job.id)) return prev;
                    return [{ job: data.job, match: data.match, status: 'pending' }, ...prev];
                });
            } else if (data.type === 'done') {
                addStep(data.message);
                setRunning(false);
                setDone(true);
                es.close();
            }
        };

        es.onerror = async () => {
            // Try to get the actual error from the server
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    const text = await res.text();
                    addStep(`Server error ${res.status}: ${text.slice(0, 200)}`, 'error');
                } else {
                    addStep('Connection lost unexpectedly.', 'error');
                }
            } catch {
                addStep('Connection lost. Agent stopped.', 'error');
            }
            setRunning(false);
            es.close();
        };
    }, [keywords, addStep]);

    const stopAgent = useCallback(() => {
        eventSourceRef.current?.close();
        addStep('Agent stopped by user.');
        setRunning(false);
    }, [addStep]);

    const handleReview = useCallback((item: DiscoveredJob) => {
        setConfirmJob({ job: item.job, match: item.match });
    }, []);

    const handleConfirm = useCallback(async () => {
        if (!confirmJob) return;
        setApplying(true);

        // Mark as applying
        setJobs((prev) =>
            prev.map((j) => (j.job.id === confirmJob.job.id ? { ...j, status: 'applying' } : j))
        );

        try {
            const res = await fetch('/api/agent/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId: confirmJob.job.id }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setJobs((prev) =>
                prev.map((j) => (j.job.id === confirmJob.job.id ? { ...j, status: 'applied' } : j))
            );

            // Open the apply URL in a new tab
            window.open(confirmJob.job.apply_url, '_blank', 'noopener,noreferrer');
        } catch (err) {
            // revert
            setJobs((prev) =>
                prev.map((j) => (j.job.id === confirmJob.job.id ? { ...j, status: 'pending' } : j))
            );
            addStep(`Failed to record application: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
        } finally {
            setApplying(false);
            setConfirmJob(null);
        }
    }, [confirmJob, addStep]);

    const handleSkip = useCallback(() => {
        if (!confirmJob) return;
        setJobs((prev) =>
            prev.map((j) => (j.job.id === confirmJob.job.id ? { ...j, status: 'skipped' } : j))
        );
        setConfirmJob(null);
    }, [confirmJob]);

    const appliedCount = jobs.filter((j) => j.status === 'applied').length;
    const pendingCount = jobs.filter((j) => j.status === 'pending').length;

    return (
        <>
            {/* Confirmation modal */}
            {confirmJob && (
                <ConfirmModal
                    item={confirmJob}
                    onConfirm={handleConfirm}
                    onSkip={handleSkip}
                    applying={applying}
                />
            )}

            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-1">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-500))' }}
                        >
                            <Bot size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">AI Job Agent</h1>
                            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                Finds and scores jobs in real-time — you confirm before every application
                            </p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="glass-card p-5 mb-6">
                    <div className="flex gap-3 items-end">
                        <div className="flex-1">
                            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                Job keywords (optional — uses your profile target roles if empty)
                            </label>
                            <input
                                type="text"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !running) startAgent(); }}
                                placeholder="e.g. software engineer, React, remote..."
                                className="input-field py-2.5 text-sm"
                                disabled={running}
                            />
                        </div>
                        {running ? (
                            <button onClick={stopAgent} className="btn-ghost" style={{ minHeight: 44, color: 'var(--color-danger-500)', borderColor: 'rgba(239,68,68,0.3)' }}>
                                <Square size={16} /> Stop
                            </button>
                        ) : (
                            <button onClick={startAgent} className="btn-primary" style={{ minHeight: 44 }}>
                                <Play size={16} /> Run Agent
                            </button>
                        )}
                    </div>

                    {/* Stats row */}
                    {(jobs.length > 0 || done) && (
                        <div className="flex gap-4 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <Stat label="Found" value={jobs.length} color="var(--color-brand-400)" />
                            <Stat label="Pending Review" value={pendingCount} color="var(--color-warning-500)" />
                            <Stat label="Applied" value={appliedCount} color="var(--color-accent-400)" />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Agent Log */}
                    <div>
                        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                    background: running ? 'var(--color-accent-400)' : done ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                                    boxShadow: running ? '0 0 6px var(--color-accent-400)' : 'none',
                                    animation: running ? 'pulse 1.5s infinite' : 'none',
                                }}
                            />
                            Agent Log
                            {running && <Loader2 size={13} className="animate-spin" style={{ color: 'rgba(255,255,255,0.3)' }} />}
                        </h2>

                        <div
                            ref={logRef}
                            className="glass-card p-4 font-mono text-xs overflow-y-auto"
                            style={{ height: 400, color: 'rgba(255,255,255,0.6)' }}
                        >
                            {steps.length === 0 ? (
                                <p style={{ color: 'rgba(255,255,255,0.2)' }}>
                                    {`> Agent ready. Press "Run Agent" to start.`}
                                </p>
                            ) : (
                                steps.map((s) => (
                                    <div key={s.id} className="flex gap-2 mb-1.5">
                                        <span style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>{s.time}</span>
                                        <span style={{ color: s.type === 'error' ? 'var(--color-danger-500)' : 'rgba(255,255,255,0.7)' }}>
                                            {s.type === 'error' ? '✗' : '›'} {s.message}
                                        </span>
                                    </div>
                                ))
                            )}
                            {running && (
                                <div className="flex gap-2 mt-1">
                                    <span style={{ color: 'rgba(255,255,255,0.25)' }}>{now()}</span>
                                    <span style={{ color: 'var(--color-brand-400)' }}>● working...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Job Results */}
                    <div>
                        <h2 className="text-sm font-semibold mb-3">
                            Job Matches
                            {jobs.length > 0 && (
                                <span className="ml-2 text-xs font-normal" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                    {jobs.length} found — sorted by score
                                </span>
                            )}
                        </h2>

                        <div className="flex flex-col gap-3 overflow-y-auto" style={{ height: 400 }}>
                            {jobs.length === 0 ? (
                                <div
                                    className="glass-card p-8 text-center h-full flex flex-col items-center justify-center"
                                    style={{ color: 'rgba(255,255,255,0.2)' }}
                                >
                                    <Bot size={36} className="mb-3" />
                                    <p className="text-sm">Jobs will appear here as they&apos;re scored</p>
                                </div>
                            ) : (
                                [...jobs]
                                    .sort((a, b) => b.match.match_score - a.match.match_score)
                                    .map((item) => (
                                        <JobResultCard
                                            key={item.job.id}
                                            item={item}
                                            onReview={() => handleReview(item)}
                                        />
                                    ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
            <p className="text-xl font-bold" style={{ color }}>{value}</p>
        </div>
    );
}
