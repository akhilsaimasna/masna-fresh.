import { Job } from '@/types/app.types';
import { hashUrl } from '../utils/hash';

export const DEFAULT_COMPANIES = [
    'notion',
    'linear',
    'pinecone',
    'perplexity',
    'anthropic',
    'figma',
    'replit'
];

interface AshbyJob {
    id: string;
    title: string;
    locationName: string;
    isRemote?: boolean;
    jobUrl?: string; // Sometimes not securely returned in brief query
    publishedAt?: string;
    departmentName?: string;
}

export async function fetchAshbyJobs(
    companies: string[] = DEFAULT_COMPANIES,
    keywords: string[] = []
): Promise<Omit<Job, 'id' | 'created_at'>[]> {
    const jobs: Omit<Job, 'id' | 'created_at'>[] = [];
    const lowerKeywords = keywords.map((k) => k.toLowerCase());

    const graphqlQuery = {
        operationName: "ApiJobBoardWithTeams",
        variables: { organizationHostedJobsPageName: "" },
        query: `query ApiJobBoardWithTeams($organizationHostedJobsPageName: String!) {
            jobBoard: jobBoardWithTeams(
                organizationHostedJobsPageName: $organizationHostedJobsPageName
            ) {
                jobPostings {
                    id
                    title
                    locationName
                }
            }
        }`
    };

    for (const company of companies) {
        try {
            graphqlQuery.variables.organizationHostedJobsPageName = company;

            const response = await fetch('https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobBoardWithTeams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(graphqlQuery)
            });

            if (!response.ok) {
                console.warn(`Ashby API returned ${response.status} for ${company}`);
                continue;
            }

            const json = await response.json();
            const jobPostings = json?.data?.jobBoard?.jobPostings;

            if (jobPostings && Array.isArray(jobPostings)) {
                for (const job of jobPostings as AshbyJob[]) {
                    // Keyword check
                    const titleMatch = lowerKeywords.length === 0 || lowerKeywords.some((k) =>
                        job.title.toLowerCase().includes(k)
                    );

                    if (titleMatch) {
                        jobs.push(normalizeAshbyJob(job, company));
                    }
                }
            }
        } catch (error) {
            console.error(`Error fetching Ashby jobs for ${company}:`, error);
        }
    }

    return jobs;
}

function normalizeAshbyJob(job: AshbyJob, company: string): Omit<Job, 'id' | 'created_at'> {
    // Ashby brief query doesn't always return full URL, but we can construct it
    const applyUrl = `https://jobs.ashbyhq.com/${company}/${job.id}`;

    // Determine remote status from location name
    let remoteType: 'Remote' | 'Hybrid' | 'On-site' | null = null;
    if (job.locationName && job.locationName.toLowerCase().includes('remote')) {
        remoteType = 'Remote';
    } else if (job.locationName) {
        remoteType = 'On-site'; // Default back to on-site for specific city names
    }

    return {
        source: 'ashby',
        external_id: job.id,
        company: company.charAt(0).toUpperCase() + company.slice(1),
        title: job.title,
        location: job.locationName || null,
        remote_type: remoteType,
        description: 'View full description on Ashby to learn more about the role and requirements.', // Needs deeper scraping for full text
        apply_url: applyUrl,
        posted_at: job.publishedAt ? new Date(job.publishedAt).toISOString() : null,
        url_hash: hashUrl(applyUrl),
        salary_min: null,
        salary_max: null,
    };
}
