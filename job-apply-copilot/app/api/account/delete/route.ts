import { createClient, createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logAudit } from '@/lib/utils/audit';

export async function DELETE() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Log before deletion
        await logAudit(user.id, 'account_deletion_requested', 'user', user.id);

        // Delete user data via RPC function
        const { error: rpcError } = await supabase.rpc('delete_user_data', {
            target_user_id: user.id,
        });

        if (rpcError) {
            console.error('RPC delete error:', rpcError);
            return NextResponse.json(
                { error: 'Failed to delete user data' },
                { status: 500 }
            );
        }

        // Delete storage objects
        const serviceClient = await createServiceClient();
        const { data: files } = await serviceClient.storage
            .from('resumes')
            .list(user.id);

        if (files && files.length > 0) {
            const filePaths = files.map((f) => `${user.id}/${f.name}`);
            await serviceClient.storage.from('resumes').remove(filePaths);
        }

        // Delete auth user
        const { error: authError } = await serviceClient.auth.admin.deleteUser(
            user.id
        );

        if (authError) {
            console.error('Auth delete error:', authError);
            // Data is already deleted, so we still return success
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Account delete error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
