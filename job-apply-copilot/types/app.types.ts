// ============================================================
// App-specific type aliases for the OpenClaw database schema
// ============================================================

export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    target_roles: string[];
    locations: string[];
    open_to_relocation: boolean;
    work_auth: 'US Citizen' | 'OPT' | 'CPT' | 'H1B' | 'Other' | null;
    experience_level: 'Internship' | 'Entry' | 'Mid' | 'Senior' | null;
    created_at: string;
    updated_at: string;
}

export interface Resume {
    id: string;
    user_id: string;
    file_name: string;
    storage_path: string;
    file_type: 'pdf' | 'docx';
    is_active: boolean;
    uploaded_at: string;
}

export interface Education {
    degree: string;
    field: string;
    institution: string;
    year: number | null;
}

export interface Project {
    name: string;
    description: string;
    tech_stack: string[];
}

export interface ResumeAnalysis {
    id: string;
    resume_id: string;
    user_id: string;
    skills: string[];
    tools: string[];
    keywords: string[];
    roles_held: string[];
    years_experience: number | null;
    education: Education[];
    projects: Project[];
    raw_text: string | null;
    full_json: Record<string, unknown> | null;
    analyzed_at: string;
}

export interface Job {
    id: string;
    source: 'greenhouse' | 'lever' | 'arbeitnow' | 'ashby' | 'google' | 'manual';
    external_id: string | null;
    company: string;
    title: string;
    location: string | null;
    remote_type: 'Remote' | 'Hybrid' | 'On-site' | null;
    description: string | null;
    apply_url: string;
    posted_at: string | null;
    url_hash: string;
    salary_min: number | null;
    salary_max: number | null;
    created_at: string;
}

export interface JobMatch {
    id: string;
    user_id: string;
    job_id: string;
    resume_id: string;
    match_score: number;
    matched_skills: string[];
    missing_skills: string[];
    match_reasoning: string | null;
    computed_at: string;
    // Joined fields
    job?: Job;
}

export interface ApplicationKit {
    id: string;
    user_id: string;
    job_id: string;
    resume_id: string;
    tailored_bullets: TailoredBullet[];
    cover_letter: string | null;
    recruiter_message: string | null;
    common_qa: QAPair[];
    apply_steps: ApplyStep[];
    generated_at: string;
}

export interface TailoredBullet {
    original: string;
    tailored: string;
    reason: string;
}

export interface QAPair {
    question: string;
    answer: string;
}

export interface ApplyStep {
    step_number: number;
    instruction: string;
    paste_content: string | null;
}

export interface Application {
    id: string;
    user_id: string;
    job_id: string;
    kit_id: string | null;
    status: 'saved' | 'applied' | 'interview' | 'offered' | 'rejected';
    applied_at: string | null;
    notes: string | null;
    updated_at: string;
    // Joined fields
    job?: Job;
    kit?: ApplicationKit;
}

export interface AuditLogEntry {
    id: number;
    user_id: string | null;
    action: string;
    entity_type: string | null;
    entity_id: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
}

// AI Response types
export interface ResumeParseResult {
    skills: string[];
    tools: string[];
    keywords: string[];
    roles_held: string[];
    years_experience: number | null;
    education: Education[];
    projects: Project[];
    summary: string;
}

export interface JobParseResult {
    required_skills: string[];
    preferred_skills: string[];
    required_tools: string[];
    keywords: string[];
    min_years_experience: number | null;
    education_requirement: string | null;
    role_type: string;
    responsibilities: string[];
    nice_to_haves: string[];
}

export interface MatchResult {
    score: number;
    matched_skills: string[];
    missing_skills: string[];
    reasoning: string;
    top_selling_points: string[];
    key_gaps: string[];
}

export interface KitResult {
    tailored_bullets: TailoredBullet[];
    cover_letter: string;
    recruiter_message: string;
    common_qa: QAPair[];
    apply_steps: ApplyStep[];
}
