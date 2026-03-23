'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/shared/Toast';
import { useDropzone } from 'react-dropzone';
import Link from 'next/link';
import {
    Upload,
    FileText,
    Trash2,
    Sparkles,
    Loader2,
    CheckCircle,
    Clock,
} from 'lucide-react';
import type { Resume, ResumeAnalysis } from '@/types/app.types';

export default function ResumePage() {
    const [resumes, setResumes] = useState<(Resume & { analysis?: ResumeAnalysis })[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState<string | null>(null);
    const { showToast } = useToast();
    const supabase = createClient();

    const fetchResumes = useCallback(async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: resumeData } = await supabase
            .from('resumes')
            .select('*')
            .eq('user_id', user.id)
            .order('uploaded_at', { ascending: false });

        const { data: analysisData } = await supabase
            .from('resume_analyses')
            .select('*')
            .eq('user_id', user.id);

        const resumesWithAnalysis = (resumeData || []).map((resume: Resume) => ({
            ...resume,
            analysis: analysisData?.find((a: ResumeAnalysis) => a.resume_id === resume.id),
        }));

        setResumes(resumesWithAnalysis);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchResumes();
    }, [fetchResumes]);

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (!file) return;

            // Validate
            const validTypes = [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ];
            if (!validTypes.includes(file.type)) {
                showToast('Please upload a PDF or DOCX file', 'error');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showToast('File size must be under 5MB', 'error');
                return;
            }

            setUploading(true);
            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/resume/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || 'Upload failed');
                }

                showToast('Resume uploaded successfully!');
                fetchResumes();
            } catch (error) {
                showToast(
                    error instanceof Error ? error.message : 'Upload failed',
                    'error'
                );
            } finally {
                setUploading(false);
            }
        },
        [showToast, fetchResumes]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        maxFiles: 1,
        disabled: uploading,
    });

    const handleAnalyze = async (resumeId: string) => {
        setAnalyzing(resumeId);
        try {
            const response = await fetch('/api/resume/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeId }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Analysis failed');
            }

            showToast('Resume analyzed with AI! 🎉');
            fetchResumes();
        } catch (error) {
            showToast(
                error instanceof Error ? error.message : 'Analysis failed',
                'error'
            );
        } finally {
            setAnalyzing(null);
        }
    };

    const handleDelete = async (resume: Resume) => {
        const { error } = await supabase
            .from('resumes')
            .delete()
            .eq('id', resume.id);

        if (error) {
            showToast('Failed to delete resume', 'error');
        } else {
            showToast('Resume deleted');
            fetchResumes();
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
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Resume</h1>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Upload your resume and let AI extract your skills
                </p>
            </div>

            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`dropzone mb-8 ${isDragActive ? 'dropzone-active' : ''}`}
            >
                <input {...getInputProps()} />
                {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2
                            size={32}
                            className="animate-spin"
                            style={{ color: 'var(--color-brand-400)' }}
                        />
                        <p className="text-sm font-medium">Uploading...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center"
                            style={{
                                background: 'rgba(51, 128, 255, 0.1)',
                                border: '1px solid rgba(51, 128, 255, 0.15)',
                            }}
                        >
                            <Upload size={24} style={{ color: 'var(--color-brand-400)' }} />
                        </div>
                        <div>
                            <p className="text-sm font-medium">
                                {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                            </p>
                            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                PDF or DOCX, max 5MB
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Resume List */}
            {resumes.length === 0 ? (
                <div className="glass-card p-8 text-center">
                    <FileText
                        size={40}
                        className="mx-auto mb-3"
                        style={{ color: 'rgba(255,255,255,0.2)' }}
                    />
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        No resumes uploaded yet
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {resumes.map((resume) => (
                        <div key={resume.id} className="glass-card p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{
                                            background: resume.analysis
                                                ? 'rgba(16, 185, 129, 0.1)'
                                                : 'rgba(255,255,255,0.05)',
                                            border: `1px solid ${resume.analysis
                                                    ? 'rgba(16, 185, 129, 0.15)'
                                                    : 'rgba(255,255,255,0.08)'
                                                }`,
                                        }}
                                    >
                                        <FileText
                                            size={18}
                                            style={{
                                                color: resume.analysis
                                                    ? 'var(--color-accent-400)'
                                                    : 'rgba(255,255,255,0.4)',
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{resume.file_name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                                {new Date(resume.uploaded_at).toLocaleDateString()}
                                            </span>
                                            {resume.analysis ? (
                                                <span className="chip chip-accent text-[10px] py-0.5 px-2">
                                                    <CheckCircle size={10} />
                                                    Analyzed
                                                </span>
                                            ) : (
                                                <span className="chip chip-neutral text-[10px] py-0.5 px-2">
                                                    <Clock size={10} />
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {resume.analysis ? (
                                        <Link
                                            href={`/resume/${resume.id}`}
                                            className="btn-ghost text-sm py-2 px-4"
                                        >
                                            View Analysis
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => handleAnalyze(resume.id)}
                                            disabled={analyzing === resume.id}
                                            className="btn-primary text-sm py-2 px-4"
                                        >
                                            {analyzing === resume.id ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <Sparkles size={14} />
                                            )}
                                            {analyzing === resume.id ? 'Analyzing...' : 'Analyze with AI'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(resume)}
                                        className="p-2 rounded-lg transition-all hover:bg-white/5"
                                        style={{ color: 'rgba(255,255,255,0.3)' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
