'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/shared/Toast';
import Link from 'next/link';
import {
    Search,
    Loader2,
    MapPin,
    Building2,
    ExternalLink,
    Star,
    RefreshCw,
    Zap,
    Filter,
    Wifi,
} from 'lucide-react';
import type { Job, JobMatch } from '@/types/app.types';

export default function JobsPage() {
    const [jobs, setJobs] = useState<(Job & { match?: JobMatch })[]>([]);
    const [loading, setLoading] = useState(true);
    const [discovering, setDiscovering] = useState(false);
    const [matching, setMatching] = useState(false);
    const [searchKeywords, setSearchKeywords] = useState('');
    const [filter, setFilter] = useState({
        minScore: 0,
        remote: '',
        search: '',
        minSalary: 0,
        locationFilter: '',
        dateRange: 'all' // all, 24h, 7d, 30d
    });
    const { showToast } = useToast();
    const supabase = createClient();

    const fetchJobs = useCallback(async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch all jobs
        const { data: jobsData } = await supabase
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false });

        // Fetch user's matches
        const { data: matchesData } = await supabase
            .from('job_matches')
            .select('*')
            .eq('user_id', user.id);

        // Merge
        const jobsWithMatches = (jobsData || []).map((job: Job) => ({
            ...job,
            match: matchesData?.find((m: JobMatch) => m.job_id === job.id),
        }));

        // Sort: matched jobs first (by score desc), then unmatched
        jobsWithMatches.sort((a: Job & { match?: JobMatch }, b: Job & { match?: JobMatch }) => {
            if (a.match && b.match) return (b.match.match_score || 0) - (a.match.match_score || 0);
            if (a.match) return -1;
            if (b.match) return 1;
            return 0;
        });

        setJobs(jobsWithMatches);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleDiscover = async () => {
        setDiscovering(true);
        try {
            const keywords = searchKeywords
                .split(',')
                .map(k => k.trim())
                .filter(Boolean);

            const response = await fetch('/api/jobs/discover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(keywords.length > 0 ? { keywords } : {}),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            const sourceInfo = data.sources
                ? ` (Greenhouse: ${data.sources.greenhouse}, Lever: ${data.sources.lever}, Arbeitnow: ${data.sources.arbeitnow}, Ashby: ${data.sources.ashby}, Google: ${data.sources.google})`
                : '';

            // Auto-filter UI by what they just searched for
            if (keywords.length > 0) {
                setFilter(prev => ({ ...prev, search: keywords[0] }));
            }

            showToast(`Discovered ${data.new} new jobs!${sourceInfo}`);
            fetchJobs();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Discovery failed', 'error');
        } finally {
            setDiscovering(false);
        }
    };

    const handleMatchAll = async () => {
        setMatching(true);
        try {
            const response = await fetch('/api/jobs/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            showToast(`Matched ${data.matches?.length || 0} jobs with your resume! 🎯`);
            fetchJobs();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Matching failed', 'error');
        } finally {
            setMatching(false);
        }
    };

    // Apply filters
    const filteredJobs = jobs.filter((job) => {
        if (filter.minScore > 0 && (!job.match || job.match.match_score < filter.minScore)) return false;
        if (filter.remote && job.remote_type !== filter.remote) return false;

        // Salary Filter
        if (filter.minSalary > 0) {
            const salary = job.salary_max || job.salary_min || 0;
            if (salary > 0 && salary < filter.minSalary) return false;
        }

        // Location Filter
        if (filter.locationFilter) {
            const locSearch = filter.locationFilter.toLowerCase();
            if (!(job.location || '').toLowerCase().includes(locSearch)) return false;
        }

        // Date Posted Filter
        if (filter.dateRange !== 'all') {
            const postedAt = job.posted_at ? new Date(job.posted_at).getTime() : job.created_at ? new Date(job.created_at).getTime() : 0;
            const now = Date.now();
            if (filter.dateRange === '24h' && now - postedAt > 24 * 60 * 60 * 1000) return false;
            if (filter.dateRange === '7d' && now - postedAt > 7 * 24 * 60 * 60 * 1000) return false;
            if (filter.dateRange === '30d' && now - postedAt > 30 * 24 * 60 * 60 * 1000) return false;
        }

        // Main Search
        if (filter.search) {
            const search = filter.search.toLowerCase();
            return (
                job.title.toLowerCase().includes(search) ||
                job.company.toLowerCase().includes(search) ||
                (job.location || '').toLowerCase().includes(search)
            );
        }
        return true;
    });

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
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Jobs</h1>
                        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            {jobs.length} jobs • {jobs.filter((j) => j.match).length} matched •
                            Sources: Greenhouse, Lever, Arbeitnow
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleMatchAll}
                            disabled={matching}
                            className="btn-primary"
                        >
                            {matching ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                            {matching ? 'Matching...' : 'AI Match'}
                        </button>
                    </div>
                </div>

                {/* Search & Discover Bar */}
                <div className="glass-card p-4 flex gap-3 items-end">
                    <div className="flex-1">
                        <label className="text-xs font-medium mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            🔍 Search keywords (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={searchKeywords}
                            onChange={(e) => setSearchKeywords(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleDiscover(); }}
                            className="input-field py-2 text-sm"
                            placeholder="e.g. engineer, mechanical, CAD, remote..."
                        />
                    </div>
                    <button
                        onClick={handleDiscover}
                        disabled={discovering}
                        className="btn-ghost whitespace-nowrap"
                        style={{ minHeight: 42 }}
                    >
                        {discovering ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        {discovering ? 'Searching...' : 'Discover Jobs'}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
                <div className="flex flex-col">
                    <label className="text-[10px] font-medium mb-1 uppercase tracking-wider opacity-50">Search Results</label>
                    <div className="relative">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                            style={{ color: 'rgba(255,255,255,0.3)' }}
                        />
                        <input
                            type="text"
                            value={filter.search}
                            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                            className="input-field pl-9 py-2 text-sm"
                            placeholder="Filter list..."
                        />
                    </div>
                </div>

                <div className="flex flex-col">
                    <label className="text-[10px] font-medium mb-1 uppercase tracking-wider opacity-50">Location</label>
                    <div className="relative">
                        <MapPin
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                            style={{ color: 'rgba(255,255,255,0.3)' }}
                        />
                        <input
                            type="text"
                            value={filter.locationFilter}
                            onChange={(e) => setFilter({ ...filter, locationFilter: e.target.value })}
                            className="input-field pl-9 py-2 text-sm"
                            placeholder="City or Country"
                        />
                    </div>
                </div>

                <div className="flex flex-col">
                    <label className="text-[10px] font-medium mb-1 uppercase tracking-wider opacity-50">Job Type</label>
                    <select
                        value={filter.remote}
                        onChange={(e) => setFilter({ ...filter, remote: e.target.value })}
                        className="input-field py-2 text-sm"
                    >
                        <option value="">All Types</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="On-site">On-site</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="text-[10px] font-medium mb-1 uppercase tracking-wider opacity-50">Min Salary</label>
                    <input
                        type="number"
                        value={filter.minSalary || ''}
                        onChange={(e) => setFilter({ ...filter, minSalary: Number(e.target.value) })}
                        className="input-field py-2 text-sm"
                        placeholder="e.g. 80000"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-[10px] font-medium mb-1 uppercase tracking-wider opacity-50">Date Posted</label>
                    <select
                        value={filter.dateRange}
                        onChange={(e) => setFilter({ ...filter, dateRange: e.target.value })}
                        className="input-field py-2 text-sm"
                    >
                        <option value="all">Anytime</option>
                        <option value="24h">Past 24h</option>
                        <option value="7d">Past 7 days</option>
                        <option value="30d">Past 30 days</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="text-[10px] font-medium mb-1 uppercase tracking-wider opacity-50">Match Score</label>
                    <select
                        value={filter.minScore}
                        onChange={(e) => setFilter({ ...filter, minScore: Number(e.target.value) })}
                        className="input-field py-2 text-sm"
                    >
                        <option value={0}>Any Score</option>
                        <option value={40}>40+ Score</option>
                        <option value={60}>60+ Score</option>
                        <option value={80}>80+ Score</option>
                    </select>
                </div>
            </div>

            {/* Jobs Grid */}
            {filteredJobs.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Search
                        size={40}
                        className="mx-auto mb-3"
                        style={{ color: 'rgba(255,255,255,0.2)' }}
                    />
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {jobs.length === 0
                            ? 'No jobs yet. Click "Discover Jobs" to find opportunities!'
                            : 'No jobs match your filters'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredJobs.map((job) => (
                        <JobCard key={job.id} job={job} match={job.match} />
                    ))}
                </div>
            )}
        </div>
    );
}

function JobCard({ job, match }: { job: Job; match?: JobMatch }) {
    const scoreClass =
        (match?.match_score || 0) >= 80
            ? 'score-high'
            : (match?.match_score || 0) >= 60
                ? 'score-medium'
                : 'score-low';

    return (
        <Link href={`/jobs/${job.id}`}>
            <div className="glass-card p-5 h-full flex flex-col cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}
                        >
                            <Building2 size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
                        </div>
                        <div>
                            <p className="text-xs font-medium" style={{ color: 'var(--color-brand-400)' }}>
                                {job.company}
                            </p>
                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                {job.source}
                            </p>
                        </div>
                    </div>
                    {match && (
                        <div className={`score-badge ${scoreClass}`}>
                            {match.match_score}
                        </div>
                    )}
                </div>

                <h3 className="text-sm font-semibold mb-2 group-hover:text-brand-400 transition-colors line-clamp-2">
                    {job.title}
                </h3>

                <div className="flex flex-wrap gap-2 mb-3">
                    {job.location && (
                        <span className="chip chip-neutral text-[11px] py-0.5">
                            <MapPin size={10} /> {job.location}
                        </span>
                    )}
                    {job.remote_type && (
                        <span className="chip chip-brand text-[11px] py-0.5">
                            <Wifi size={10} /> {job.remote_type}
                        </span>
                    )}
                </div>

                {match && match.matched_skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-auto pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        {match.matched_skills.slice(0, 3).map((skill) => (
                            <span key={skill} className="chip chip-accent text-[10px] py-0.5 px-2">
                                {skill}
                            </span>
                        ))}
                        {match.matched_skills.length > 3 && (
                            <span className="chip chip-neutral text-[10px] py-0.5 px-2">
                                +{match.matched_skills.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </Link>
    );
}
