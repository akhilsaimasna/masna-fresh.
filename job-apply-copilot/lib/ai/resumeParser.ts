import type { ResumeAnalysis } from '@/types/app.types';

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

export async function parseResume(rawText: string): Promise<ResumeAnalysis> {
    const prompt = `You are a resume parsing expert. Extract structured data from the following resume text.

Return ONLY valid JSON with this exact structure (no markdown, no code fences, no explanation):
{
  "skills": ["string array of technical skills"],
  "tools": ["string array of tools, platforms, frameworks"],
  "keywords": ["string array of industry keywords"],
  "roles_held": ["string array of past job titles"],
  "years_experience": number_or_null,
  "education": [{"degree":"string","field":"string","institution":"string","year":"string or null"}],
  "projects": [{"name":"string","description":"string","tech_stack":["string"]}]
}

Resume text:
${rawText}`;

    const text = await groqChat(prompt);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('Failed to parse resume: no JSON in AI response');
    }

    return JSON.parse(jsonMatch[0]) as ResumeAnalysis;
}
