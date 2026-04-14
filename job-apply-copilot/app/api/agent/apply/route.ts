import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
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

        const { jobId, kitId, notes } = await request.json();

        if (!jobId) {
            return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
        }

        // Check if already applied
        const { data: existing } = await supabase
            .from('applications')
            .select('id, status')
            .eq('user_id', user.id)
            .eq('job_id', jobId)
            .single();

        if (existing && existing.status === 'applied') {
            return NextResponse.json({ error: 'Already applied to this job' }, { status: 409 });
        }

        // Upsert application record as "applied"
        const { data: application, error } = await supabase
            .from('applications')
            .upsert(
                {
                    user_id: user.id,
                    job_id: jobId,
                    kit_id: kitId || null,
                    status: 'applied',
                    applied_at: new Date().toISOString(),
                    notes: notes || null,
                },
                { onConflict: 'user_id,job_id' }
            )
            .select()
            .single();

        if (error) {
            console.error('Apply error:', error);
            return NextResponse.json({ error: 'Failed to record application' }, { status: 500 });
        }

        await logAudit(user.id, 'job_applied', 'applications', application.id, {
            job_id: jobId,
            source: 'agent',
        });

        return NextResponse.json({ success: true, application });
    } catch (err) {
        console.error('Apply route error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
