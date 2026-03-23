import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { extractText } from '@/lib/utils/pdfExtract';
import { parseResume } from '@/lib/ai/resumeParser';
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

        const { resumeId } = await request.json();

        if (!resumeId) {
            return NextResponse.json(
                { error: 'resumeId is required' },
                { status: 400 }
            );
        }

        // Fetch the resume record (RLS ensures user owns it)
        const { data: resume, error: fetchError } = await supabase
            .from('resumes')
            .select('*')
            .eq('id', resumeId)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !resume) {
            return NextResponse.json(
                { error: 'Resume not found' },
                { status: 404 }
            );
        }

        // Download file from Storage
        const { data: fileData, error: downloadError } = await supabase.storage
            .from('resumes')
            .download(resume.storage_path);

        if (downloadError || !fileData) {
            console.error('Download error:', downloadError);
            return NextResponse.json(
                { error: 'Failed to download resume file' },
                { status: 500 }
            );
        }

        // Extract text
        const buffer = Buffer.from(await fileData.arrayBuffer());
        const rawText = await extractText(buffer, resume.file_type);

        if (!rawText || rawText.trim().length < 50) {
            return NextResponse.json(
                { error: 'Could not extract enough text from the resume. Please check the file.' },
                { status: 400 }
            );
        }

        // Parse with AI (has built-in retry for rate limits)
        let analysis;
        try {
            analysis = await parseResume(rawText);
        } catch (aiError: unknown) {
            const err = aiError as { status?: number; message?: string };
            console.error('AI analysis error:', err);
            if (err.status === 429) {
                return NextResponse.json(
                    { error: 'AI service is busy. Please wait 30 seconds and try again.' },
                    { status: 429 }
                );
            }
            return NextResponse.json(
                { error: 'AI analysis failed. Please try again.' },
                { status: 500 }
            );
        }

        // Store in database
        const { data: analysisRecord, error: insertError } = await supabase
            .from('resume_analyses')
            .insert({
                resume_id: resumeId,
                user_id: user.id,
                skills: analysis.skills,
                tools: analysis.tools,
                keywords: analysis.keywords,
                roles_held: analysis.roles_held,
                years_experience: analysis.years_experience,
                education: analysis.education,
                projects: analysis.projects,
                raw_text: rawText,
                full_json: analysis as unknown as Record<string, unknown>,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Insert analysis error:', insertError);
            return NextResponse.json(
                { error: 'Failed to save analysis' },
                { status: 500 }
            );
        }

        // Audit log
        await logAudit(user.id, 'resume_analyzed', 'resume_analysis', analysisRecord.id, {
            resume_id: resumeId,
            skills_count: analysis.skills.length,
        });

        return NextResponse.json(analysisRecord);
    } catch (error) {
        console.error('Resume analyze error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
