'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Copy,
    CheckCircle,
    ExternalLink,
    FileText,
    MessageSquare,
    HelpCircle,
    Navigation,
    Sparkles,
    Building2,
} from 'lucide-react';
import { useToast } from '@/components/shared/Toast';
import type { ApplicationKit, Job } from '@/types/app.types';

type TabId = 'bullets' | 'cover' | 'recruiter' | 'qa' | 'guide';

export default function KitViewerPage() {
    const params = useParams();
    const jobId = params.jobId as string;
    const [kit, setKit] = useState<ApplicationKit | null>(null);
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabId>('bullets');
    const { showToast } = useToast();
    const supabase = createClient();

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

            const { data: kitData } = await supabase
                .from('application_kits')
                .select('*')
                .eq('user_id', user.id)
                .eq('job_id', jobId)
                .single();
            setKit(kitData);

            setLoading(false);
        };
        fetchData();
    }, [jobId, supabase]);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        showToast(`${label} copied to clipboard!`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="loading-spinner" style={{ width: 40, height: 40 }} />
            </div>
        );
    }

    if (!kit || !job) {
        return (
            <div className="text-center py-20">
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>Kit not found</p>
                <Link href="/jobs" className="btn-ghost mt-4 inline-flex">
                    <ArrowLeft size={16} /> Back to Jobs
                </Link>
            </div>
        );
    }

    const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
        { id: 'bullets', label: 'Tailored Bullets', icon: <Sparkles size={14} /> },
        { id: 'cover', label: 'Cover Letter', icon: <FileText size={14} /> },
        { id: 'recruiter', label: 'Recruiter Note', icon: <MessageSquare size={14} /> },
        { id: 'qa', label: 'Q&A Prep', icon: <HelpCircle size={14} /> },
        { id: 'guide', label: 'Apply Guide', icon: <Navigation size={14} /> },
    ];

    return (
        <div className="max-w-4xl">
            <Link
                href="/jobs"
                className="inline-flex items-center gap-2 text-sm mb-6"
                style={{ color: 'rgba(255,255,255,0.4)' }}
            >
                <ArrowLeft size={14} /> Back to Jobs
            </Link>

            {/* Header */}
            <div className="glass-card p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Building2 size={14} style={{ color: 'var(--color-brand-400)' }} />
                            <span className="text-sm" style={{ color: 'var(--color-brand-400)' }}>
                                {job.company}
                            </span>
                        </div>
                        <h1 className="text-xl font-bold">{job.title}</h1>
                    </div>
                    <a
                        href={job.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                    >
                        <ExternalLink size={16} />
                        Apply Now
                    </a>
                </div>
            </div>

            {/* Tabs */}
            <div className="tab-list mb-6 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`tab-trigger flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'active' : ''
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="glass-card p-6">
                {activeTab === 'bullets' && (
                    <div>
                        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <Sparkles size={16} style={{ color: 'var(--color-brand-400)' }} />
                            Tailored Resume Bullets
                        </h2>
                        <div className="space-y-4">
                            {kit.tailored_bullets?.map((bullet, i) => (
                                <div
                                    key={i}
                                    className="p-4 rounded-xl"
                                    style={{
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                    }}
                                >
                                    <div className="mb-2">
                                        <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                            Original:
                                        </p>
                                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                            {bullet.original}
                                        </p>
                                    </div>
                                    <div className="mb-2">
                                        <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-accent-400)' }}>
                                            Tailored:
                                        </p>
                                        <p className="text-sm">{bullet.tailored}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                            💡 {bullet.reason}
                                        </p>
                                        <button
                                            onClick={() => copyToClipboard(bullet.tailored, 'Bullet')}
                                            className="btn-ghost py-1 px-2 text-xs"
                                        >
                                            <Copy size={12} /> Copy
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'cover' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold flex items-center gap-2">
                                <FileText size={16} style={{ color: 'var(--color-brand-400)' }} />
                                Cover Letter
                            </h2>
                            <button
                                onClick={() => copyToClipboard(kit.cover_letter || '', 'Cover letter')}
                                className="btn-ghost text-sm"
                            >
                                <Copy size={14} /> Copy All
                            </button>
                        </div>
                        <div
                            className="text-sm leading-relaxed whitespace-pre-wrap p-4 rounded-xl"
                            style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                color: 'rgba(255,255,255,0.7)',
                            }}
                        >
                            {kit.cover_letter || 'No cover letter generated'}
                        </div>
                    </div>
                )}

                {activeTab === 'recruiter' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold flex items-center gap-2">
                                <MessageSquare size={16} style={{ color: 'var(--color-brand-400)' }} />
                                Recruiter Message
                            </h2>
                            <button
                                onClick={() => copyToClipboard(kit.recruiter_message || '', 'Message')}
                                className="btn-ghost text-sm"
                            >
                                <Copy size={14} /> Copy
                            </button>
                        </div>
                        <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            Short note for LinkedIn DM or email (under 150 words)
                        </p>
                        <div
                            className="text-sm leading-relaxed whitespace-pre-wrap p-4 rounded-xl"
                            style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                color: 'rgba(255,255,255,0.7)',
                            }}
                        >
                            {kit.recruiter_message || 'No recruiter message generated'}
                        </div>
                    </div>
                )}

                {activeTab === 'qa' && (
                    <div>
                        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <HelpCircle size={16} style={{ color: 'var(--color-brand-400)' }} />
                            Interview Q&A Prep
                        </h2>
                        <div className="space-y-4">
                            {kit.common_qa?.map((qa, i) => (
                                <div
                                    key={i}
                                    className="p-4 rounded-xl"
                                    style={{
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                    }}
                                >
                                    <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-brand-300)' }}>
                                        Q: {qa.question}
                                    </p>
                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                        {qa.answer}
                                    </p>
                                    <button
                                        onClick={() => copyToClipboard(qa.answer, 'Answer')}
                                        className="btn-ghost py-1 px-2 text-xs mt-2"
                                    >
                                        <Copy size={12} /> Copy Answer
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'guide' && (
                    <div>
                        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <Navigation size={16} style={{ color: 'var(--color-accent-400)' }} />
                            Step-by-Step Apply Guide
                        </h2>
                        <div
                            className="p-3 rounded-lg mb-6"
                            style={{
                                background: 'rgba(51, 128, 255, 0.05)',
                                border: '1px solid rgba(51, 128, 255, 0.1)',
                            }}
                        >
                            <p className="text-xs" style={{ color: 'var(--color-brand-300)' }}>
                                🦾 You are in the driver&apos;s seat — follow these steps to apply manually
                            </p>
                        </div>
                        <div className="space-y-4">
                            {kit.apply_steps?.map((step, i) => (
                                <div
                                    key={i}
                                    className="flex gap-4 p-4 rounded-xl"
                                    style={{
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                    }}
                                >
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                        style={{
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            color: 'var(--color-accent-400)',
                                            fontWeight: 700,
                                            fontSize: 14,
                                        }}
                                    >
                                        {step.step_number}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium mb-1">{step.instruction}</p>
                                        {step.paste_content && (
                                            <div className="mt-2">
                                                <div
                                                    className="p-3 rounded-lg text-xs font-mono"
                                                    style={{
                                                        background: 'rgba(0,0,0,0.3)',
                                                        border: '1px solid rgba(255,255,255,0.06)',
                                                        color: 'rgba(255,255,255,0.6)',
                                                    }}
                                                >
                                                    {step.paste_content}
                                                </div>
                                                <button
                                                    onClick={() => copyToClipboard(step.paste_content!, 'Content')}
                                                    className="btn-ghost py-1 px-2 text-xs mt-2"
                                                >
                                                    <Copy size={12} /> Copy to Clipboard
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
