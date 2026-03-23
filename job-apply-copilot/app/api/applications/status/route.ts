import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logAudit } from '@/lib/utils/audit';

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { jobId, status, notes } = await request.json();

        if (!jobId || !status) {
            return NextResponse.json(
                { error: 'jobId and status are required' },
                { status: 400 }
            );
        }

        const validStatuses = ['saved', 'applied', 'interview', 'offered', 'rejected'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
                { status: 400 }
            );
        }

        const updateData: Record<string, unknown> = {
            user_id: user.id,
            job_id: jobId,
            status,
            updated_at: new Date().toISOString(),
        };

        if (notes !== undefined) {
            updateData.notes = notes;
        }

        if (status === 'applied') {
            updateData.applied_at = new Date().toISOString();
        }

        const { data: app, error } = await supabase
            .from('applications')
            .upsert(updateData, { onConflict: 'user_id,job_id' })
            .select()
            .single();

        if (error) {
            console.error('Status update error:', error);
            return NextResponse.json(
                { error: 'Failed to update status' },
                { status: 500 }
            );
        }

        await logAudit(user.id, 'status_updated', 'application', app.id, {
            job_id: jobId,
            new_status: status,
        });

        return NextResponse.json(app);
    } catch (error) {
        console.error('Status update error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
