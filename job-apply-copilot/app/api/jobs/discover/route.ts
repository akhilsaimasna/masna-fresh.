import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { fetchGreenhouseJobs } from '@/lib/jobs/greenhouse';
import { fetchLeverJobs } from '@/lib/jobs/lever';
import { fetchArbeitnowJobs } from '@/lib/jobs/arbeitnow';
import { fetchAshbyJobs } from '@/lib/jobs/ashby';
import { fetchGoogleJobs } from '@/lib/jobs/google';
import { deduplicateJobs } from '@/lib/jobs/deduplicator';
import { logAudit } from '@/lib/utils/audit';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Accept optional search keywords from the request body
        let searchKeywords: string[] = [];
        try {
            const body = await request.json();
            if (body.keywords && Array.isArray(body.keywords)) {
                searchKeywords = body.keywords;
            }
        } catch {
            // No body provided, use profile target roles
        }

        // If no keywords in request, fall back to profile
        if (searchKeywords.length === 0) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('target_roles, locations')
                .eq('id', user.id)
                .single();

            searchKeywords = profile?.target_roles || [];
        }

        // Fetch from all sources in parallel
        const [greenhouseJobs, leverJobs, arbeitnowJobs, ashbyJobs, googleJobs] = await Promise.all([
            fetchGreenhouseJobs(undefined, searchKeywords),
            fetchLeverJobs(undefined, searchKeywords),
            fetchArbeitnowJobs(searchKeywords, 3),
            fetchAshbyJobs(undefined, searchKeywords),
            fetchGoogleJobs(searchKeywords), // Searches Google Jobs
        ]);

        const allNewJobs = [...greenhouseJobs, ...leverJobs, ...arbeitnowJobs, ...ashbyJobs, ...googleJobs];

        // Get existing url_hashes to deduplicate
        const serviceClient = await createServiceClient();
        const { data: existingJobs } = await serviceClient
            .from('jobs')
            .select('url_hash');

        const existingHashes = new Set(
            (existingJobs || []).map((j: { url_hash: string }) => j.url_hash)
        );

        const uniqueJobs = deduplicateJobs(allNewJobs as Omit<import('@/types/app.types').Job, 'id' | 'created_at'>[], existingHashes);

        // Batch insert new jobs
        let insertedCount = 0;
        if (uniqueJobs.length > 0) {
            for (let i = 0; i < uniqueJobs.length; i += 50) {
                const batch = uniqueJobs.slice(i, i + 50);
                const { error } = await serviceClient.from('jobs').insert(batch);
                if (!error) {
                    insertedCount += batch.length;
                } else {
                    console.error('Job insert error:', error);
                }
            }
        }

        // Audit log
        await logAudit(user.id, 'jobs_discovered', 'jobs', undefined, {
            total_fetched: allNewJobs.length,
            new_inserted: insertedCount,
            sources: ['greenhouse', 'lever', 'arbeitnow', 'ashby', 'google'],
            keywords: searchKeywords,
        });

        return NextResponse.json({
            discovered: allNewJobs.length,
            new: insertedCount,
            duplicates: allNewJobs.length - uniqueJobs.length,
            sources: {
                greenhouse: greenhouseJobs.length,
                lever: leverJobs.length,
                arbeitnow: arbeitnowJobs.length,
                ashby: ashbyJobs.length,
                google: googleJobs.length,
            },
        });
    } catch (error) {
        console.error('Job discover error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
