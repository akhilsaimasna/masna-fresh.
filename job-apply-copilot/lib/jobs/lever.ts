import type { Job } from '@/types/app.types';
import { hashUrl } from '@/lib/utils/hash';

interface LeverPosting {
    id: string;
    text: string;
    categories: {
        commitment?: string;
        department?: string;
        location?: string;
        team?: string;
    };
    description: string;
    descriptionPlain: string;
    lists: { text: string; content: string }[];
    additional: string;
    additionalPlain: string;
    hostedUrl: string;
    applyUrl: string;
    createdAt: number;
    workplaceType?: string;
}

// Popular companies with Lever boards (public, ToS-compliant)
const DEFAULT_COMPANIES = [
    'netflix',
    'twilio',
    'lever',
    'netlify',
    'vercel',
    'supabase',
    'prisma',
    'sanity',
    'retool',
    'linear',
    'dbt-labs',
    'grafana-labs',
    'temporal-technologies',
    'planetscale',
    'neon',
];

function normalizeLeverJob(posting: LeverPosting, company: string): Omit<Job, 'id' | 'created_at'> {
    const location = posting.categories?.location || '';
    let remoteType: 'Remote' | 'Hybrid' | 'On-site' | null = null;

    if (posting.workplaceType === 'remote' || /remote/i.test(location)) {
        remoteType = 'Remote';
    } else if (posting.workplaceType === 'hybrid' || /hybrid/i.test(location)) {
        remoteType = 'Hybrid';
    } else if (posting.workplaceType === 'onsite' || location) {
        remoteType = 'On-site';
    }

    // Combine description and lists for full JD
    const fullDescription = [
        posting.descriptionPlain || '',
        ...posting.lists.map((l) => `${l.text}\n${l.content.replace(/<[^>]*>/g, ' ')}`),
        posting.additionalPlain || '',
    ]
        .filter(Boolean)
        .join('\n\n')
        .replace(/\s+/g, ' ')
        .trim();

    return {
        source: 'lever',
        external_id: posting.id,
        company: company.charAt(0).toUpperCase() + company.slice(1).replace(/-/g, ' '),
        title: posting.text,
        location: location || null,
        remote_type: remoteType,
        description: fullDescription,
        apply_url: posting.hostedUrl,
        posted_at: posting.createdAt ? new Date(posting.createdAt).toISOString() : null,
        url_hash: hashUrl(posting.hostedUrl),
        salary_min: null,
        salary_max: null,
    };
}

export async function fetchLeverJobs(
    companies?: string[],
    titleFilter?: string[]
): Promise<Omit<Job, 'id' | 'created_at'>[]> {
    const companyList = companies && companies.length > 0 ? companies : DEFAULT_COMPANIES;
    const allJobs: Omit<Job, 'id' | 'created_at'>[] = [];

    for (const company of companyList) {
        try {
            const url = `https://api.lever.co/v0/postings/${company}?mode=json`;
            const response = await fetch(url, {
                headers: { 'Accept': 'application/json' },
                signal: AbortSignal.timeout(10000),
            });

            if (!response.ok) continue;

            let postings: LeverPosting[] = await response.json();

            // Filter by title if specified
            if (titleFilter && titleFilter.length > 0) {
                const lowerFilters = titleFilter.map((t) => t.toLowerCase());
                postings = postings.filter((posting) =>
                    lowerFilters.some(
                        (filter) =>
                            posting.text.toLowerCase().includes(filter) ||
                            filter.split(' ').every((word) => posting.text.toLowerCase().includes(word))
                    )
                );
            }

            const normalized = postings.map((posting) => normalizeLeverJob(posting, company));
            allJobs.push(...normalized);
        } catch (error) {
            console.warn(`Failed to fetch Lever jobs for ${company}:`, error);
            continue;
        }
    }

    return allJobs;
}
