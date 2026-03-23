import { Job } from '@/types/app.types';
import { hashUrl } from '../utils/hash';

export async function fetchGoogleJobs(
    keywords: string[] = [],
    location: string = 'United States'
): Promise<Omit<Job, 'id' | 'created_at'>[]> {
    const jobs: Omit<Job, 'id' | 'created_at'>[] = [];
    const apiKey = process.env.SERPAPI_KEY;

    if (!apiKey) {
        console.warn('SERPAPI_KEY is not set. Skipping Google Jobs fetch.');
        return jobs;
    }

    // Default to a broad search if no keywords provided
    const query = keywords.length > 0 ? keywords.join(' OR ') : 'Software Engineer';

    try {
        const url = new URL('https://serpapi.com/search.json');
        url.searchParams.append('engine', 'google_jobs');
        url.searchParams.append('q', query);
        url.searchParams.append('location', location);
        url.searchParams.append('api_key', apiKey);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`SerpAPI error: ${response.status}`);
            return jobs;
        }

        const data = await response.json();
        const results = data.jobs_results || [];

        for (const job of results) {
            jobs.push(normalizeGoogleJob(job));
        }

    } catch (error) {
        console.error('Error fetching Google Jobs:', error);
    }

    return jobs;
}

function normalizeGoogleJob(job: any): Omit<Job, 'id' | 'created_at'> {
    // Attempt to extract the first apply URL provided by Google, otherwise use the Google link
    const applyUrl = job.apply_options && job.apply_options.length > 0
        ? job.apply_options[0].link
        : job.share_link || 'https://google.com/search?q=jobs';

    // Google often returns HTML descriptions or plain text
    const description = job.description
        ? job.description.substring(0, 1000) + (job.description.length > 1000 ? '...' : '')
        : 'View full description on the application page.';

    // Try to determine remote status from the location string
    let remoteType: 'Remote' | 'Hybrid' | 'On-site' | null = null;
    const loc = job.location ? job.location.toLowerCase() : '';
    if (loc.includes('remote') || loc.includes('anywhere')) {
        remoteType = 'Remote';
    } else if (loc.includes('hybrid')) {
        remoteType = 'Hybrid';
    } else if (loc) {
        remoteType = 'On-site';
    }

    // Google jobs generates hash IDs
    const externalId = job.job_id || hashUrl(applyUrl + job.title);

    return {
        source: 'google',
        external_id: externalId,
        company: job.company_name || 'Unknown Company',
        title: job.title || 'Unknown Title',
        location: job.location || null,
        remote_type: remoteType,
        description: description,
        apply_url: applyUrl,
        posted_at: null, // SerpAPI returns relative "14 hours ago", so we leave null for now
        url_hash: hashUrl(applyUrl),
        salary_min: null,
        salary_max: null,
    };
}
