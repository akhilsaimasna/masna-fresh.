-- ============================================================
-- Job Copilot: Storage Setup
-- Run this in Supabase SQL Editor AFTER 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- 1. CREATE THE RESUMES STORAGE BUCKET
--    Note: Supabase storage buckets must be created via the
--    API or Dashboard. The SQL below sets RLS policies for the
--    bucket, but you MUST create the bucket first via the
--    Supabase Dashboard OR the Storage API call below.
--
--    Dashboard path:
--      Storage → New bucket → Name: "resumes" → Private (NOT public)
-- ============================================================

-- ============================================================
-- 2. STORAGE ROW LEVEL SECURITY POLICIES
--    These control which authenticated users can access which files.
--    Path convention: {user_id}/{timestamp}_{filename}
--    e.g. "a1b2c3d4-.../1713400000000_my_resume.pdf"
-- ============================================================

-- Allow authenticated users to upload their own files
-- (only to their own user_id subfolder)
CREATE POLICY "resumes_storage_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own files
CREATE POLICY "resumes_storage_select"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own files
CREATE POLICY "resumes_storage_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================
-- 3. VERIFICATION QUERY
--    Run this after setup to confirm policies are in place
-- ============================================================
-- SELECT policyname, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'objects'
--   AND schemaname = 'storage'
--   AND policyname LIKE 'resumes_%';
