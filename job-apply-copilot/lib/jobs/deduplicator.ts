import type { Job } from '@/types/app.types';

/**
 * Deduplicates jobs by url_hash.
 * Returns only jobs whose url_hash does NOT already exist in the provided set.
 */
export function deduplicateJobs(
    newJobs: Omit<Job, 'id' | 'created_at'>[],
    existingHashes: Set<string>
): Omit<Job, 'id' | 'created_at'>[] {
    const seen = new Set<string>(existingHashes);
    const unique: Omit<Job, 'id' | 'created_at'>[] = [];

    for (const job of newJobs) {
        if (!seen.has(job.url_hash)) {
            seen.add(job.url_hash);
            unique.push(job);
        }
    }

    return unique;
}
