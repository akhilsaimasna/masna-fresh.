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

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only PDF and DOCX are accepted.' },
                { status: 400 }
            );
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 5MB.' },
                { status: 400 }
            );
        }

        const fileType = file.type === 'application/pdf' ? 'pdf' : 'docx';
        const timestamp = Date.now();
        const storagePath = `${user.id}/${timestamp}_${file.name}`;

        // Upload to Supabase Storage
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(storagePath, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error('Storage upload error:', uploadError);
            return NextResponse.json(
                { error: 'Failed to upload file' },
                { status: 500 }
            );
        }

        // Insert database record
        const { data: resume, error: dbError } = await supabase
            .from('resumes')
            .insert({
                user_id: user.id,
                file_name: file.name,
                storage_path: storagePath,
                file_type: fileType,
                is_active: true,
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database insert error:', dbError);
            return NextResponse.json(
                { error: 'Failed to save resume record' },
                { status: 500 }
            );
        }

        // Audit log
        await logAudit(user.id, 'resume_uploaded', 'resume', resume.id, {
            file_name: file.name,
            file_type: fileType,
        });

        return NextResponse.json({ id: resume.id, storage_path: storagePath });
    } catch (error) {
        console.error('Resume upload error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
