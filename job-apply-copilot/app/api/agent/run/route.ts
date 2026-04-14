import { createClient, createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { fetchGreenhouseJobs } from '@/lib/jobs/greenhouse';
import { fetchLeverJobs } from '@/lib/jobs/lever';
import { fetchArbeitnowJobs } from '@/lib/jobs/arbeitnow';
import { fetchAshbyJobs } from '@/lib/jobs/ashby';
import { deduplicateJobs } from '@/lib/jobs/deduplicator';
import { parseJobDescription, computeMatchScore } from '@/lib/ai/jobMatcher';
import type { Job } from '@/types/app.types';

function encode(data: object) {
    return `data: ${JSON.stringify(data)}\n\n`;
}

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    // ── Auth & clients must be created BEFORE the stream ──
    let supabase: Awaited<ReturnType<typeof createClient>>;
    let serviceClient: Awaited<ReturnType<typeof createServiceClient>>;
    let user: { id: string } | null = null;

    try {
        supabase = await createClient();
        const { data } = await supabase.auth.getUser();
        user = data.user;
        serviceClient = await createServiceClient();
    } catch (err) {
        return NextResponse.json(
            { error: `Setup failed: ${err instanceof Error ? err.message : String(err)}` },
            { status: 500 }
        );
    }

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized — please log in' }, { status: 401 });
    }

    let keywords: string[] = [];
    try {
        const body = await request.json();
        if (Array.isArray(body.keywords)) keywords = body.keywords;
    } catch {
        // no body is fine
    }

    const stream = new ReadableStream({
        async start(controller) {
            const send = (data: object) => {
                try {
                    controller.enqueue(new TextEncoder().encode(encode(data)));
                } catch {
                    // client disconnected
                }
            };

            try {
                // Step 1: Load resume analysis
                send({ type: 'step', message: 'Loading your resume analysis...' });

                const { data: analysis } = await supabase
                    .from('resume_analyses')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('analyzed_at', { ascending: false })
                    .limit(1)
                    .single();

                if (!analysis) {
                    send({
                        type: 'error',
                        message: 'No resume found. Please upload and analyze a resume first.',
                    });
                    controller.close();
                    return;
                }

                send({
                    type: 'step',
                    message: `Resume loaded — ${analysis.skills?.length || 0} skills, ${analysis.years_experience || '?'} yrs experience`,
                });

                // Step 2: Resolve keywords
                let searchKeywords = keywords;
                if (searchKeywords.length === 0) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('target_roles')
                        .eq('id', user.id)
                        .single();
                    searchKeywords =
                        profile?.target_roles?.length
                            ? profile.target_roles
                            : analysis.roles_held?.slice(0, 3) || [];
                }

                send({ type: 'step', message: `Searching for: ${searchKeywords.join(', ')}` });

                // Step 3: Discover jobs from all sources in parallel
                send({ type: 'step', message: 'Scanning Greenhouse, Lever, Ashby, Arbeitnow...' });

                const [greenhouseJobs, leverJobs, arbeitnowJobs, ashbyJobs] = await Promise.all([
                    fetchGreenhouseJobs(undefined, searchKeywords).catch(() => []),
                    fetchLeverJobs(undefined, searchKeywords).catch(() => []),
                    fetchArbeitnowJobs(searchKeywords, 2).catch(() => []),
                    fetchAshbyJobs(undefined, searchKeywords).catch(() => []),
                ]);

                const allNewJobs = [
                    ...greenhouseJobs,
                    ...leverJobs,
                    ...arbeitnowJobs,
                    ...ashbyJobs,
                ];

                send({
                    type: 'step',
                    message: `Found ${allNewJobs.length} jobs — Greenhouse: ${greenhouseJobs.length}, Lever: ${leverJobs.length}, Arbeitnow: ${arbeitnowJobs.length}, Ashby: ${ashbyJobs.length}`,
                });

                // Step 4: Deduplicate & store new jobs
                const { data: existingJobs } = await serviceClient
                    .from('jobs')
                    .select('url_hash');
                const existingHashes = new Set(
                    (existingJobs || []).map((j: { url_hash: string }) => j.url_hash)
                );
                const uniqueJobs = deduplicateJobs(
                    allNewJobs as Omit<Job, 'id' | 'created_at'>[],
                    existingHashes
                );

                let insertedCount = 0;
                if (uniqueJobs.length > 0) {
                    const { data: inserted } = await serviceClient
                        .from('jobs')
                        .insert(uniqueJobs)
                        .select();
                    insertedCount = inserted?.length || 0;
                }

                send({ type: 'step', message: `Saved ${insertedCount} new jobs to database` });

                // Step 5: Get jobs to score
                const { data: jobsToScore } = await supabase
                    .from('jobs')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(30);

                if (!jobsToScore || jobsToScore.length === 0) {
                    send({ type: 'done', message: 'No jobs to score.' });
                    controller.close();
                    return;
                }

                // Skip already matched jobs
                const { data: existingMatches } = await supabase
                    .from('job_matches')
                    .select('job_id')
                    .eq('user_id', user.id)
                    .eq('resume_id', analysis.resume_id);

                const alreadyMatchedIds = new Set(
                    (existingMatches || []).map((m: { job_id: string }) => m.job_id)
                );
                const unscored = (jobsToScore as Job[]).filter(
                    (j) => !alreadyMatchedIds.has(j.id)
                );

                // Stream previously matched jobs first so user sees something immediately
                if (existingMatches && existingMatches.length > 0) {
                    const { data: previousMatches } = await supabase
                        .from('job_matches')
                        .select('*, job:jobs(*)')
                        .eq('user_id', user.id)
                        .order('match_score', { ascending: false })
                        .limit(20);

                    for (const m of previousMatches || []) {
                        if (m.job) {
                            send({ type: 'job', job: m.job, match: m });
                        }
                    }
                }

                send({
                    type: 'step',
                    message: `Scoring ${unscored.length} new jobs against your resume...`,
                });

                const resumeJson = JSON.stringify({
                    skills: analysis.skills,
                    tools: analysis.tools,
                    keywords: analysis.keywords,
                    roles_held: analysis.roles_held,
                    years_experience: analysis.years_experience,
                    education: analysis.education,
                });

                // Step 6: Score each new job and stream result immediately
                for (const job of unscored) {
                    try {
                        const jobAnalysis = await parseJobDescription(job.description || '');
                        const match = await computeMatchScore(
                            resumeJson,
                            JSON.stringify(jobAnalysis)
                        );

                        const { data: matchRecord } = await supabase
                            .from('job_matches')
                            .upsert(
                                {
                                    user_id: user.id,
                                    job_id: job.id,
                                    resume_id: analysis.resume_id,
                                    match_score: Math.round(match.score),
                                    matched_skills: match.matched_skills,
                                    missing_skills: match.missing_skills,
                                    match_reasoning: match.reasoning,
                                },
                                { onConflict: 'user_id,job_id,resume_id' }
                            )
                            .select()
                            .single();

                        if (matchRecord) {
                            send({ type: 'job', job, match: matchRecord });
                        }
                    } catch {
                        continue;
                    }
                }

                send({ type: 'done', message: 'Agent finished. Review your matches and apply.' });
            } catch (err) {
                send({
                    type: 'error',
                    message: err instanceof Error ? err.message : 'Agent encountered an error',
                });
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        },
    });
}
