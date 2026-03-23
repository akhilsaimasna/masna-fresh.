import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hashUrl } from '@/lib/utils/hash';

// Allowed origins for CORS (Chrome extension)
const ALLOWED_ORIGIN = 'chrome-extension://';

export async function GET(request: Request) {
    const origin = request.headers.get('origin') || '';

    const headers = new Headers();
    if (origin.startsWith(ALLOWED_ORIGIN)) {
        headers.set('Access-Control-Allow-Origin', origin);
        headers.set('Access-Control-Allow-Credentials', 'true');
    }

    try {
        const { searchParams } = new URL(request.url);
        const jobUrl = searchParams.get('url');

        if (!jobUrl) {
            return NextResponse.json({ error: 'URL parameter is required' }, { status: 400, headers });
        }

        const supabase = await createClient();

        // 1. Verify Authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please check you are logged into OpenClaw.' },
                { status: 401, headers }
            );
        }

        // 2. Fetch User Profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        // 3. Find the Job using a multi-strategy approach:
        let matchedJob: { id: string } | null = null;

        // Strategy A: Try hash match with the exact URL as-is
        const urlHashExact = hashUrl(jobUrl);
        const { data: jobByExactHash } = await supabase
            .from('jobs')
            .select('id')
            .eq('url_hash', urlHashExact)
            .single();

        if (jobByExactHash) {
            matchedJob = jobByExactHash;
        }

        // Strategy B: Try hash match with URL stripped of query params (for Lever URLs, etc.)
        if (!matchedJob) {
            const strippedUrl = jobUrl.split('?')[0].replace(/\/$/, '');
            const urlHashStripped = hashUrl(strippedUrl);
            const { data: jobByStrippedHash } = await supabase
                .from('jobs')
                .select('id')
                .eq('url_hash', urlHashStripped)
                .single();

            if (jobByStrippedHash) {
                matchedJob = jobByStrippedHash;
            }
        }

        // Strategy C: Extract the numeric job ID from the URL path and search apply_url column
        // e.g. boards.greenhouse.io/anduril/jobs/4988675007 -> external_id = "4988675007"
        if (!matchedJob) {
            const pathMatch = jobUrl.match(/\/jobs\/(\d+)/);
            if (pathMatch) {
                const externalId = pathMatch[1];
                const { data: jobByExternalId } = await supabase
                    .from('jobs')
                    .select('id')
                    .eq('external_id', externalId)
                    .single();

                if (jobByExternalId) {
                    matchedJob = jobByExternalId;
                }
            }
        }

        // Strategy D: For Lever URLs -> extract the UUID job ID from the path
        // e.g. jobs.lever.co/company/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx -> external_id
        if (!matchedJob) {
            const leverMatch = jobUrl.match(/\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
            if (leverMatch) {
                const externalId = leverMatch[1];
                const { data: jobByExternalId } = await supabase
                    .from('jobs')
                    .select('id')
                    .eq('external_id', externalId)
                    .single();

                if (jobByExternalId) {
                    matchedJob = jobByExternalId;
                }
            }
        }

        let kit = null;

        // 4. Find the Kit if the job was found by any strategy
        if (matchedJob) {
            const { data: kitData } = await supabase
                .from('application_kits')
                .select('*')
                .eq('user_id', user.id)
                .eq('job_id', matchedJob.id)
                .single();

            kit = kitData;
        }

        // Return the data
        return NextResponse.json({
            user: { email: user.email },
            profile: profile || {},
            kit: kit,
            foundJob: !!matchedJob,
            debug: {
                receivedUrl: jobUrl,
                hashComputed: urlHashExact,
            }
        }, { status: 200, headers });

    } catch (error) {
        console.error('Extension API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers }
        );
    }
}

// Handle pre-flight CORS requests from the Chrome extension
export async function OPTIONS(request: Request) {
    const origin = request.headers.get('origin') || '';
    const headers = new Headers();
    if (origin.startsWith(ALLOWED_ORIGIN)) {
        headers.set('Access-Control-Allow-Origin', origin);
        headers.set('Access-Control-Allow-Credentials', 'true');
        headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    return new NextResponse(null, { status: 204, headers });
}
