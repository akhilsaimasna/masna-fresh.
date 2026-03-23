import { hashUrl } from '@/lib/utils/hash';

interface ArbeitnowJob {
    slug: string;
    company_name: string;
    title: string;
    description: string;
    remote: boolean;
    url: string;
    tags: string[];
    job_types: string[];
    location: string;
    created_at: number;
}

export async function fetchArbeitnowJobs(
    keywords?: string[],
    maxPages: number = 3
) {
    const jobs: {
        title: string;
        company: string;
        location: string;
        source: 'arbeitnow';
        external_id: string;
        url_hash: string;
        description: string;
        apply_url: string;
        posted_at: string | null;
        remote_type: string;
        salary_min: number | null;
        salary_max: number | null;
    }[] = [];

    try {
        for (let page = 1; page <= maxPages; page++) {
            const url = `https://www.arbeitnow.com/api/job-board-api?page=${page}`;
            const res = await fetch(url, {
                headers: { Accept: 'application/json' },
            });

            if (!res.ok) {
                console.error(`Arbeitnow API error: ${res.status}`);
                break;
            }

            const data = await res.json();
            const rawJobs: ArbeitnowJob[] = data.data || [];

            if (rawJobs.length === 0) break;

            for (const job of rawJobs) {
                // Filter by keywords — match individual words for broader results
                if (keywords && keywords.length > 0) {
                    const searchText =
                        `${job.title} ${job.tags?.join(' ') || ''} ${job.description || ''}`.toLowerCase();
                    const allWords = keywords.flatMap((kw) =>
                        kw.toLowerCase().split(/\s+/)
                    );
                    const matched = allWords.some(
                        (word) => word.length > 2 && searchText.includes(word)
                    );
                    if (!matched) continue;
                }

                // Strip HTML from description
                const plainDesc = (job.description || '')
                    .replace(/<[^>]*>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();

                jobs.push({
                    title: job.title,
                    company: job.company_name,
                    location: job.location || (job.remote ? 'Remote' : 'Unknown'),
                    source: 'arbeitnow',
                    external_id: job.slug,
                    url_hash: hashUrl(job.url),
                    description: plainDesc,
                    apply_url: job.url,
                    posted_at: job.created_at
                        ? new Date(job.created_at * 1000).toISOString()
                        : null,
                    remote_type: job.remote ? 'Remote' : 'On-site',
                    salary_min: null,
                    salary_max: null,
                });
            }
        }
    } catch (error) {
        console.error('Arbeitnow fetch error:', error);
    }

    return jobs;
}
