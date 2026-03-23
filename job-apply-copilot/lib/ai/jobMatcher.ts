const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function groqChat(prompt: string): Promise<string> {
    const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 4096,
        }),
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error('Groq API error:', res.status, errorText);
        throw new Error(`Groq API error: ${res.status}`);
    }

    const data = await res.json();
    return data.choices[0].message.content;
}

export async function parseJobDescription(description: string) {
    const prompt = `You are a job description parser. Extract structured data from the following job description.

Return ONLY valid JSON (no markdown, no code fences, no explanation):
{
  "required_skills": ["string array"],
  "preferred_skills": ["string array"],
  "responsibilities": ["string array"],
  "requirements": ["string array"],
  "experience_level": "string or null",
  "remote_type": "Remote | Hybrid | On-site | null"
}

Job description:
${description}`;

    const text = await groqChat(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse JD: no JSON in AI response');
    return JSON.parse(jsonMatch[0]);
}

export async function computeMatchScore(
    resumeJson: string,
    jobJson: string
): Promise<{
    score: number;
    matched_skills: string[];
    missing_skills: string[];
    reasoning: string;
}> {
    const prompt = `You are a job match evaluator. Compare the candidate resume against the job requirements and compute a match score from 0-100.

Return ONLY valid JSON (no markdown, no code fences, no explanation):
{
  "score": number_0_to_100,
  "matched_skills": ["skills the candidate has that match the job"],
  "missing_skills": ["skills the job requires that the candidate lacks"],
  "reasoning": "2-3 sentence explanation of the match"
}

Candidate Resume:
${resumeJson}

Job Requirements:
${jobJson}`;

    const text = await groqChat(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to compute match: no JSON in AI response');
    return JSON.parse(jsonMatch[0]);
}
