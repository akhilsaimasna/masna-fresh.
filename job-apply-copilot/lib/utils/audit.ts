import { createServiceClient } from '@/lib/supabase/server';

export async function logAudit(
    userId: string | null,
    action: string,
    entityType?: string,
    entityId?: string,
    metadata?: Record<string, unknown>
) {
    try {
        const supabase = await createServiceClient();
        await supabase.from('audit_log').insert({
            user_id: userId,
            action,
            entity_type: entityType ?? null,
            entity_id: entityId ?? null,
            metadata: metadata ?? null,
        });
    } catch (error) {
        console.error('Audit log failed:', error);
        // Don't throw — audit logging should never break the main flow
    }
}
