const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface KitInput {
  resumeAnalysisJson: string;
  company: string;
  title: string;
  jobDescription: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

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
      temperature: 0.4,
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

export async function generateKit(input: KitInput) {
  const prompt = `You are an expert career coach. Generate a complete application kit for this candidate applying to this job.

Return ONLY valid JSON (no markdown, no code fences, no explanation):
{
  "tailored_bullets": [
    {
      "original": "original resume bullet",
      "tailored": "rewritten bullet emphasizing relevant skills for this job",
      "reason": "why this change helps"
    }
  ],
  "cover_letter": "Full cover letter text (3-4 paragraphs), addressed to hiring team at ${input.company}",
  "recruiter_message": "Short LinkedIn/email DM to a recruiter (under 150 words)",
  "common_qa": [
    {
      "question": "Likely interview question for this role",
      "answer": "Suggested answer using the candidate's background"
    }
  ],
  "apply_steps": [
    {
      "step_number": 1,
      "instruction": "What to do in this step",
      "paste_content": "Text to copy-paste if applicable, or null"
    }
  ]
}

Generate 3-5 tailored bullets, a professional cover letter, a concise recruiter message, 3-5 Q&A pairs, and 4-6 apply steps.

Candidate Resume Analysis:
${input.resumeAnalysisJson}

Target Company: ${input.company}
Target Role: ${input.title}
Match Score: ${input.matchScore}/100
Matched Skills: ${input.matchedSkills.join(', ')}
Missing Skills: ${input.missingSkills.join(', ')}

Job Description:
${input.jobDescription}`;

  const text = await groqChat(prompt);
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to generate kit: no JSON in AI response');
  return JSON.parse(jsonMatch[0]);
}
