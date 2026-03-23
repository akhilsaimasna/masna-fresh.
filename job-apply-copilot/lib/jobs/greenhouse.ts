import type { Job } from '@/types/app.types';
import { hashUrl } from '@/lib/utils/hash';

interface GreenhouseJob {
    id: number;
    title: string;
    location: { name: string };
    absolute_url: string;
    updated_at: string;
    content: string;
    departments: { name: string }[];
    metadata?: { id: number; name: string; value: string | string[] | null }[];
}

interface GreenhouseResponse {
    jobs: GreenhouseJob[];
}

// Popular companies with Greenhouse boards (public, ToS-compliant)
const DEFAULT_COMPANIES = [
    'airbnb',
    'spotify',
    'stripe',
    'figma',
    'notion',
    'discord',
    'gitlab',
    'hashicorp',
    'cloudflare',
    'datadog',
    'mongodb',
    'elastic',
    'cockroachlabs',
    'pagerduty',
    'twitch',
    'andurilindustries',
    'formlabs',
];

function normalizeGreenhouseJob(job: GreenhouseJob, company: string): Omit<Job, 'id' | 'created_at'> {
    // Strip HTML tags from content
    const description = job.content?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '';

    // Try to detect remote type from location
    const locationName = job.location?.name || '';
    let remoteType: 'Remote' | 'Hybrid' | 'On-site' | null = null;
    if (/remote/i.test(locationName)) remoteType = 'Remote';
    else if (/hybrid/i.test(locationName)) remoteType = 'Hybrid';
    else if (locationName) remoteType = 'On-site';

    return {
        source: 'greenhouse',
        external_id: String(job.id),
        company: company.charAt(0).toUpperCase() + company.slice(1),
        title: job.title,
        location: locationName || null,
        remote_type: remoteType,
        description,
        apply_url: job.absolute_url,
        posted_at: job.updated_at || null,
        url_hash: hashUrl(job.absolute_url),
        salary_min: null,
        salary_max: null,
    };
}

export async function fetchGreenhouseJobs(
    companies?: string[],
    titleFilter?: string[]
): Promise<Omit<Job, 'id' | 'created_at'>[]> {
    const companyList = companies && companies.length > 0 ? companies : DEFAULT_COMPANIES;
    const allJobs: Omit<Job, 'id' | 'created_at'>[] = [];

    for (const company of companyList) {
        try {
            const url = `https://boards-api.greenhouse.io/v1/boards/${company}/jobs?content=true`;
            const response = await fetch(url, {
                headers: { 'Accept': 'application/json' },
                signal: AbortSignal.timeout(10000),
            });

            if (!response.ok) continue;

            const data: GreenhouseResponse = await response.json();

            let jobs = data.jobs || [];

            // Filter by title if specified
            if (titleFilter && titleFilter.length > 0) {
                const lowerFilters = titleFilter.map((t) => t.toLowerCase());
                jobs = jobs.filter((job) =>
                    lowerFilters.some(
                        (filter) =>
                            job.title.toLowerCase().includes(filter) ||
                            filter.split(' ').every((word) => job.title.toLowerCase().includes(word))
                    )
                );
            }

            const normalized = jobs.map((job) => normalizeGreenhouseJob(job, company));
            allJobs.push(...normalized);
        } catch (error) {
            console.warn(`Failed to fetch Greenhouse jobs for ${company}:`, error);
            continue;
        }
    }

    return allJobs;
}
