import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateKit } from '@/lib/ai/kitGenerator';
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

        const { jobIds } = await request.json();

        if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
            return NextResponse.json(
                { error: 'jobIds array is required' },
                { status: 400 }
            );
        }

        if (jobIds.length > 5) {
            return NextResponse.json(
                { error: 'Maximum 5 kits per request' },
                { status: 400 }
            );
        }

        // Get user's latest resume analysis
        const { data: analysis } = await supabase
            .from('resume_analyses')
            .select('*')
            .eq('user_id', user.id)
            .order('analyzed_at', { ascending: false })
            .limit(1)
            .single();

        if (!analysis) {
            return NextResponse.json(
                { error: 'No resume analysis found. Please analyze your resume first.' },
                { status: 400 }
            );
        }

        const kits = [];

        for (const jobId of jobIds) {
            try {
                // Fetch job and match data
                const { data: job } = await supabase
                    .from('jobs')
                    .select('*')
                    .eq('id', jobId)
                    .single();

                if (!job) continue;

                const { data: match } = await supabase
                    .from('job_matches')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('job_id', jobId)
                    .single();

                const resumeJson = JSON.stringify({
                    skills: analysis.skills,
                    tools: analysis.tools,
                    keywords: analysis.keywords,
                    roles_held: analysis.roles_held,
                    years_experience: analysis.years_experience,
                    education: analysis.education,
                    projects: analysis.projects,
                });

                const kitResult = await generateKit({
                    resumeAnalysisJson: resumeJson,
                    company: job.company,
                    title: job.title,
                    jobDescription: job.description || '',
                    matchScore: match?.match_score || 50,
                    matchedSkills: match?.matched_skills || [],
                    missingSkills: match?.missing_skills || [],
                });

                // Upsert kit
                const { data: kitRecord, error: insertError } = await supabase
                    .from('application_kits')
                    .upsert(
                        {
                            user_id: user.id,
                            job_id: jobId,
                            resume_id: analysis.resume_id,
                            tailored_bullets: kitResult.tailored_bullets,
                            cover_letter: kitResult.cover_letter,
                            recruiter_message: kitResult.recruiter_message,
                            common_qa: kitResult.common_qa,
                            apply_steps: kitResult.apply_steps,
                        },
                        { onConflict: 'user_id,job_id,resume_id' }
                    )
                    .select()
                    .single();

                if (!insertError && kitRecord) {
                    kits.push(kitRecord);

                    // Also create/update application status to 'saved'
                    await supabase
                        .from('applications')
                        .upsert(
                            {
                                user_id: user.id,
                                job_id: jobId,
                                kit_id: kitRecord.id,
                                status: 'saved',
                            },
                            { onConflict: 'user_id,job_id' }
                        );

                    await logAudit(user.id, 'kit_generated', 'application_kit', kitRecord.id, {
                        job_id: jobId,
                        company: job.company,
                        title: job.title,
                    });
                }
            } catch (error) {
                console.error(`Failed to generate kit for job ${jobId}:`, error);
                continue;
            }
        }

        return NextResponse.json({ kits, count: kits.length });
    } catch (error) {
        console.error('Kit generate error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
