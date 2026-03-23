import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { parseJobDescription, computeMatchScore } from '@/lib/ai/jobMatcher';
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

        const body = await request.json();
        const jobIds: string[] = body.jobIds;

        // Get user's active resume analysis
        const { data: analysis } = await supabase
            .from('resume_analyses')
            .select('*, resumes!inner(is_active)')
            .eq('user_id', user.id)
            .order('analyzed_at', { ascending: false })
            .limit(1)
            .single();

        if (!analysis) {
            return NextResponse.json(
                { error: 'No resume analysis found. Please upload and analyze a resume first.' },
                { status: 400 }
            );
        }

        // Fetch jobs to match
        let jobsQuery = supabase.from('jobs').select('*');
        if (jobIds && jobIds.length > 0) {
            jobsQuery = jobsQuery.in('id', jobIds);
        } else {
            // Get jobs that haven't been matched yet for this user + resume
            const { data: existingMatches } = await supabase
                .from('job_matches')
                .select('job_id')
                .eq('user_id', user.id)
                .eq('resume_id', analysis.resume_id);

            const matchedJobIds = (existingMatches || []).map((m: { job_id: string }) => m.job_id);

            if (matchedJobIds.length > 0) {
                jobsQuery = jobsQuery.not('id', 'in', `(${matchedJobIds.join(',')})`);
            }
            jobsQuery = jobsQuery.limit(20); // Limit to 20 at a time
        }

        const { data: jobs, error: jobsError } = await jobsQuery;

        if (jobsError || !jobs || jobs.length === 0) {
            return NextResponse.json({
                matches: [],
                message: 'No new jobs to match',
            });
        }

        const resumeJson = JSON.stringify({
            skills: analysis.skills,
            tools: analysis.tools,
            keywords: analysis.keywords,
            roles_held: analysis.roles_held,
            years_experience: analysis.years_experience,
            education: analysis.education,
            projects: analysis.projects,
        });

        const results = [];

        // Process jobs sequentially to avoid rate limits
        for (const job of jobs) {
            try {
                // Parse JD
                const jobAnalysis = await parseJobDescription(job.description || '');
                const jobJson = JSON.stringify(jobAnalysis);

                // Compute match
                const match = await computeMatchScore(resumeJson, jobJson);

                // Store in database
                const { data: matchRecord, error: insertError } = await supabase
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

                if (!insertError && matchRecord) {
                    results.push({ ...matchRecord, job });
                }
            } catch (error) {
                console.error(`Failed to match job ${job.id}:`, error);
                continue;
            }
        }

        // Sort by score descending
        results.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

        await logAudit(user.id, 'jobs_matched', 'job_matches', undefined, {
            jobs_matched: results.length,
        });

        return NextResponse.json({ matches: results });
    } catch (error) {
        console.error('Job match error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
