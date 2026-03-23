'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Code,
    Wrench,
    GraduationCap,
    FolderOpen,
    Briefcase,
    Clock,
    Hash,
} from 'lucide-react';
import type { ResumeAnalysis } from '@/types/app.types';

export default function ResumeAnalysisPage() {
    const params = useParams();
    const resumeId = params.resumeId as string;
    const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchAnalysis = async () => {
            const { data } = await supabase
                .from('resume_analyses')
                .select('*')
                .eq('resume_id', resumeId)
                .order('analyzed_at', { ascending: false })
                .limit(1)
                .single();

            setAnalysis(data);
            setLoading(false);
        };
        fetchAnalysis();
    }, [resumeId, supabase]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="loading-spinner" style={{ width: 40, height: 40 }} />
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="text-center py-20">
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>Analysis not found</p>
                <Link href="/resume" className="btn-ghost mt-4 inline-flex">
                    <ArrowLeft size={16} /> Back to Resumes
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            <Link
                href="/resume"
                className="inline-flex items-center gap-2 text-sm mb-6"
                style={{ color: 'rgba(255,255,255,0.4)' }}
            >
                <ArrowLeft size={14} /> Back to Resumes
            </Link>

            <div className="mb-8">
                <h1 className="text-2xl font-bold">Resume Analysis</h1>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    AI-extracted insights from your resume
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                <MiniStat
                    icon={<Code size={16} />}
                    label="Skills"
                    value={analysis.skills?.length || 0}
                    color="brand"
                />
                <MiniStat
                    icon={<Wrench size={16} />}
                    label="Tools"
                    value={analysis.tools?.length || 0}
                    color="accent"
                />
                <MiniStat
                    icon={<Briefcase size={16} />}
                    label="Roles"
                    value={analysis.roles_held?.length || 0}
                    color="warning"
                />
                <MiniStat
                    icon={<Clock size={16} />}
                    label="Years Exp"
                    value={analysis.years_experience ?? 'N/A'}
                    color="brand"
                />
            </div>

            {/* Skills */}
            <Section
                icon={<Code size={18} />}
                title="Technical Skills"
                color="var(--color-brand-400)"
            >
                <div className="flex flex-wrap gap-2">
                    {analysis.skills?.map((skill) => (
                        <span key={skill} className="chip chip-brand">
                            {skill}
                        </span>
                    ))}
                    {(!analysis.skills || analysis.skills.length === 0) && (
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            No skills extracted
                        </p>
                    )}
                </div>
            </Section>

            {/* Tools */}
            <Section
                icon={<Wrench size={18} />}
                title="Tools & Platforms"
                color="var(--color-accent-400)"
            >
                <div className="flex flex-wrap gap-2">
                    {analysis.tools?.map((tool) => (
                        <span key={tool} className="chip chip-accent">
                            {tool}
                        </span>
                    ))}
                    {(!analysis.tools || analysis.tools.length === 0) && (
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            No tools extracted
                        </p>
                    )}
                </div>
            </Section>

            {/* Keywords */}
            <Section
                icon={<Hash size={18} />}
                title="Keywords"
                color="var(--color-warning-500)"
            >
                <div className="flex flex-wrap gap-2">
                    {analysis.keywords?.map((kw) => (
                        <span key={kw} className="chip chip-warning">
                            {kw}
                        </span>
                    ))}
                    {(!analysis.keywords || analysis.keywords.length === 0) && (
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            No keywords extracted
                        </p>
                    )}
                </div>
            </Section>

            {/* Education */}
            <Section
                icon={<GraduationCap size={18} />}
                title="Education"
                color="var(--color-brand-400)"
            >
                <div className="space-y-3">
                    {analysis.education?.map((edu, i) => (
                        <div
                            key={i}
                            className="p-4 rounded-xl"
                            style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.06)',
                            }}
                        >
                            <p className="text-sm font-medium">{edu.degree} in {edu.field}</p>
                            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                {edu.institution} {edu.year ? `• ${edu.year}` : ''}
                            </p>
                        </div>
                    ))}
                    {(!analysis.education || analysis.education.length === 0) && (
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            No education found
                        </p>
                    )}
                </div>
            </Section>

            {/* Projects */}
            <Section
                icon={<FolderOpen size={18} />}
                title="Projects"
                color="var(--color-accent-400)"
            >
                <div className="space-y-3">
                    {analysis.projects?.map((proj, i) => (
                        <div
                            key={i}
                            className="p-4 rounded-xl"
                            style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.06)',
                            }}
                        >
                            <p className="text-sm font-medium">{proj.name}</p>
                            <p
                                className="text-xs mt-1"
                                style={{ color: 'rgba(255,255,255,0.4)' }}
                            >
                                {proj.description}
                            </p>
                            {proj.tech_stack?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {proj.tech_stack.map((tech) => (
                                        <span key={tech} className="chip chip-neutral text-[10px] py-0.5 px-2">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    {(!analysis.projects || analysis.projects.length === 0) && (
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            No projects found
                        </p>
                    )}
                </div>
            </Section>

            {/* Roles Held */}
            <Section
                icon={<Briefcase size={18} />}
                title="Roles Held"
                color="var(--color-warning-500)"
            >
                <div className="flex flex-wrap gap-2">
                    {analysis.roles_held?.map((role) => (
                        <span key={role} className="chip chip-warning">
                            {role}
                        </span>
                    ))}
                    {(!analysis.roles_held || analysis.roles_held.length === 0) && (
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            No roles found
                        </p>
                    )}
                </div>
            </Section>
        </div>
    );
}

function Section({
    icon,
    title,
    color,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    color: string;
    children: React.ReactNode;
}) {
    return (
        <div className="glass-card p-6 mb-4">
            <h2
                className="text-sm font-semibold mb-4 flex items-center gap-2"
                style={{ color }}
            >
                {icon}
                {title}
            </h2>
            {children}
        </div>
    );
}

function MiniStat({
    icon,
    label,
    value,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    color: string;
}) {
    const colors: Record<string, { bg: string; text: string }> = {
        brand: { bg: 'rgba(51, 128, 255, 0.1)', text: 'var(--color-brand-400)' },
        accent: { bg: 'rgba(16, 185, 129, 0.1)', text: 'var(--color-accent-400)' },
        warning: { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--color-warning-500)' },
    };

    return (
        <div className="glass-card p-4 text-center">
            <div
                className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center"
                style={{ background: colors[color].bg, color: colors[color].text }}
            >
                {icon}
            </div>
            <p className="text-lg font-bold" style={{ color: colors[color].text }}>
                {value}
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {label}
            </p>
        </div>
    );
}
