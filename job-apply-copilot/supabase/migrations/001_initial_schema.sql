-- ============================================================
-- OpenClaw: Full Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  target_roles  TEXT[],
  locations     TEXT[],
  open_to_relocation BOOLEAN DEFAULT FALSE,
  work_auth     TEXT,
  experience_level TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- RESUMES
CREATE TABLE IF NOT EXISTS public.resumes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name     TEXT NOT NULL,
  storage_path  TEXT NOT NULL,
  file_type     TEXT NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  uploaded_at   TIMESTAMPTZ DEFAULT NOW()
);

-- RESUME ANALYSES
CREATE TABLE IF NOT EXISTS public.resume_analyses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id         UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skills            TEXT[],
  tools             TEXT[],
  keywords          TEXT[],
  roles_held        TEXT[],
  years_experience  NUMERIC(4,1),
  education         JSONB,
  projects          JSONB,
  raw_text          TEXT,
  full_json         JSONB,
  analyzed_at       TIMESTAMPTZ DEFAULT NOW()
);

-- JOBS
CREATE TABLE IF NOT EXISTS public.jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source          TEXT NOT NULL,
  source_id       TEXT,
  company         TEXT NOT NULL,
  title           TEXT NOT NULL,
  location        TEXT,
  remote_type     TEXT,
  description     TEXT,
  apply_url       TEXT NOT NULL,
  posted_at       TIMESTAMPTZ,
  url_hash        TEXT UNIQUE NOT NULL,
  raw_json        JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- JOB MATCHES
CREATE TABLE IF NOT EXISTS public.job_matches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id          UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  resume_id       UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  match_score     SMALLINT CHECK (match_score BETWEEN 0 AND 100),
  matched_skills  TEXT[],
  missing_skills  TEXT[],
  match_reasoning TEXT,
  computed_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id, resume_id)
);

-- APPLICATION KITS
CREATE TABLE IF NOT EXISTS public.application_kits (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id              UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  resume_id           UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  tailored_bullets    JSONB,
  cover_letter        TEXT,
  recruiter_message   TEXT,
  common_qa           JSONB,
  apply_steps         JSONB,
  generated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id, resume_id)
);

-- APPLICATIONS
CREATE TABLE IF NOT EXISTS public.applications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id      UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  kit_id      UUID REFERENCES public.application_kits(id),
  status      TEXT NOT NULL DEFAULT 'saved'
                CHECK (status IN ('saved','applied','interview','offered','rejected')),
  applied_at  TIMESTAMPTZ,
  notes       TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- AUDIT LOG
CREATE TABLE IF NOT EXISTS public.audit_log (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_resumes_user      ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user     ON public.resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_resume   ON public.resume_analyses(resume_id);
CREATE INDEX IF NOT EXISTS idx_matches_user      ON public.job_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_score     ON public.job_matches(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_applications_user ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_url_hash     ON public.jobs(url_hash);
CREATE INDEX IF NOT EXISTS idx_audit_user        ON public.audit_log(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analyses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_matches       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_kits  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log         ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- RESUMES
CREATE POLICY "resumes_select_own" ON public.resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "resumes_insert_own" ON public.resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "resumes_delete_own" ON public.resumes FOR DELETE USING (auth.uid() = user_id);

-- RESUME ANALYSES
CREATE POLICY "analyses_select_own" ON public.resume_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "analyses_insert_own" ON public.resume_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- JOB MATCHES
CREATE POLICY "matches_select_own" ON public.job_matches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "matches_insert_own" ON public.job_matches FOR INSERT WITH CHECK (auth.uid() = user_id);

-- APPLICATION KITS
CREATE POLICY "kits_select_own" ON public.application_kits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "kits_insert_own" ON public.application_kits FOR INSERT WITH CHECK (auth.uid() = user_id);

-- APPLICATIONS
CREATE POLICY "apps_select_own" ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "apps_insert_own" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "apps_update_own" ON public.applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "apps_delete_own" ON public.applications FOR DELETE USING (auth.uid() = user_id);

-- AUDIT LOG
CREATE POLICY "audit_select_own" ON public.audit_log FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.delete_user_data(target_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  DELETE FROM public.applications      WHERE user_id = target_user_id;
  DELETE FROM public.application_kits  WHERE user_id = target_user_id;
  DELETE FROM public.job_matches       WHERE user_id = target_user_id;
  DELETE FROM public.resume_analyses   WHERE user_id = target_user_id;
  DELETE FROM public.resumes           WHERE user_id = target_user_id;
  DELETE FROM public.profiles          WHERE id = target_user_id;
END;
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to auto-create profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
