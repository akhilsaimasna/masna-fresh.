'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
    FileText,
    Briefcase,
    Target,
    TrendingUp,
    ArrowRight,
    User,
    Upload,
    Zap,
} from 'lucide-react';
import type { Profile, Resume, ResumeAnalysis, JobMatch, Application } from '@/types/app.types';

export default function DashboardPage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
    const [matchCount, setMatchCount] = useState(0);
    const [applicationCounts, setApplicationCounts] = useState({
        saved: 0,
        applied: 0,
        interview: 0,
        offered: 0,
        rejected: 0,
    });
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            setProfile(profileData);

            // Fetch resumes
            const { data: resumeData } = await supabase
                .from('resumes')
                .select('*')
                .eq('user_id', user.id)
                .order('uploaded_at', { ascending: false });
            setResumes(resumeData || []);

            // Fetch latest analysis
            const { data: analysisData } = await supabase
                .from('resume_analyses')
                .select('*')
                .eq('user_id', user.id)
                .order('analyzed_at', { ascending: false })
                .limit(1)
                .single();
            setAnalysis(analysisData);

            // Count matches
            const { count } = await supabase
                .from('job_matches')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);
            setMatchCount(count || 0);

            // Count applications by status
            const { data: apps } = await supabase
                .from('applications')
                .select('status')
                .eq('user_id', user.id);
            if (apps) {
                const counts = { saved: 0, applied: 0, interview: 0, offered: 0, rejected: 0 };
                apps.forEach((app: { status: string }) => {
                    if (app.status in counts) {
                        counts[app.status as keyof typeof counts]++;
                    }
                });
                setApplicationCounts(counts);
            }

            setLoading(false);
        };
        fetchData();
    }, [supabase]);

    // Profile completeness
    const profileFields = profile
        ? [
            profile.full_name,
            profile.target_roles?.length,
            profile.locations?.length,
            profile.work_auth,
            profile.experience_level,
        ]
        : [];
    const completedFields = profileFields.filter(Boolean).length;
    const profileCompleteness = Math.round((completedFields / 5) * 100);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="loading-spinner" style={{ width: 40, height: 40 }} />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold">
                    Welcome back
                    {profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''} 👋
                </h1>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Here&apos;s your job search overview
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon={<FileText size={20} />}
                    label="Resumes"
                    value={resumes.length}
                    color="brand"
                />
                <StatCard
                    icon={<Target size={20} />}
                    label="Job Matches"
                    value={matchCount}
                    color="accent"
                />
                <StatCard
                    icon={<Briefcase size={20} />}
                    label="Applied"
                    value={applicationCounts.applied}
                    color="warning"
                />
                <StatCard
                    icon={<TrendingUp size={20} />}
                    label="Interviews"
                    value={applicationCounts.interview}
                    color="brand"
                />
            </div>

            {/* Quick Actions & Profile Completeness */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Completeness */}
                <div className="glass-card p-6">
                    <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <User size={16} style={{ color: 'var(--color-brand-400)' }} />
                        Profile Completeness
                    </h2>
                    <div className="flex items-center gap-4 mb-3">
                        <div className="progress-bar flex-1">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${profileCompleteness}%`,
                                    background:
                                        profileCompleteness === 100
                                            ? 'var(--color-accent-500)'
                                            : 'var(--color-brand-500)',
                                }}
                            />
                        </div>
                        <span className="text-sm font-bold" style={{ color: 'var(--color-brand-400)' }}>
                            {profileCompleteness}%
                        </span>
                    </div>
                    {profileCompleteness < 100 && (
                        <Link
                            href="/profile"
                            className="text-xs flex items-center gap-1 mt-2"
                            style={{ color: 'var(--color-brand-400)' }}
                        >
                            Complete your profile <ArrowRight size={12} />
                        </Link>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="glass-card p-6 lg:col-span-2">
                    <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <Zap size={16} style={{ color: 'var(--color-warning-500)' }} />
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <QuickAction
                            href="/resume"
                            icon={<Upload size={18} />}
                            label="Upload Resume"
                            description="Add or update your resume"
                        />
                        <QuickAction
                            href="/jobs"
                            icon={<Briefcase size={18} />}
                            label="Discover Jobs"
                            description="Find matching opportunities"
                        />
                        <QuickAction
                            href="/tracker"
                            icon={<Target size={18} />}
                            label="Track Progress"
                            description="View application status"
                        />
                    </div>
                </div>
            </div>

            {/* Skills Preview */}
            {analysis && (
                <div className="glass-card p-6 mt-6">
                    <h2 className="text-sm font-semibold mb-4">Your Skills Profile</h2>
                    <div className="flex flex-wrap gap-2">
                        {analysis.skills?.slice(0, 15).map((skill) => (
                            <span key={skill} className="chip chip-brand">
                                {skill}
                            </span>
                        ))}
                        {analysis.tools?.slice(0, 10).map((tool) => (
                            <span key={tool} className="chip chip-accent">
                                {tool}
                            </span>
                        ))}
                        {(analysis.skills?.length || 0) + (analysis.tools?.length || 0) > 25 && (
                            <Link href={`/resume/${analysis.resume_id}`} className="chip chip-neutral">
                                +{(analysis.skills?.length || 0) + (analysis.tools?.length || 0) - 25} more
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: 'brand' | 'accent' | 'warning';
}) {
    const colors = {
        brand: { bg: 'rgba(51, 128, 255, 0.1)', border: 'rgba(51, 128, 255, 0.15)', text: 'var(--color-brand-400)' },
        accent: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.15)', text: 'var(--color-accent-400)' },
        warning: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.15)', text: 'var(--color-warning-500)' },
    };

    return (
        <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                        background: colors[color].bg,
                        border: `1px solid ${colors[color].border}`,
                        color: colors[color].text,
                    }}
                >
                    {icon}
                </div>
                <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {label}
                </span>
            </div>
            <p className="text-3xl font-bold" style={{ color: colors[color].text }}>
                {value}
            </p>
        </div>
    );
}

function QuickAction({
    href,
    icon,
    label,
    description,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 p-3 rounded-xl transition-all"
            style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
            }}
        >
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{
                    background: 'rgba(51, 128, 255, 0.1)',
                    color: 'var(--color-brand-400)',
                }}
            >
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {description}
                </p>
            </div>
        </Link>
    );
}
