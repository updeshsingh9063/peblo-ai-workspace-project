// src/lib/groq.ts — Groq AI Client for note summarization
import Groq from 'groq-sdk';

export interface AIInsights {
  summary: string;
  action_items: string[];
  suggested_title: string;
  key_topics: string[];
}

function getGroqClient(): Groq {
  return new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy-key' });
}

export async function generateNoteInsights(
  content: string,
  title: string
): Promise<AIInsights> {
  const groq = getGroqClient();

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are Peblo AI — an intelligent note analysis assistant.
Analyze the user's note and respond ONLY with valid JSON matching this exact structure:
{
  "summary": "2-3 sentence summary capturing the core ideas and context",
  "action_items": ["Specific actionable task 1", "Specific actionable task 2"],
  "suggested_title": "A clear, concise descriptive title for this note",
  "key_topics": ["topic-1", "topic-2", "topic-3"]
}
Rules:
- summary: professional, concise, captures essence
- action_items: concrete tasks or follow-ups implied or stated in the text
- suggested_title: descriptive and meaningful
- key_topics: 3-5 keywords or categories
- Return raw JSON only. No markdown code fences.`,
      },
      {
        role: 'user',
        content: `Note Title: ${title}\n\nNote Content:\n${content}`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content || '{}';

  try {
    return JSON.parse(text.trim()) as AIInsights;
  } catch {
    throw new Error('Failed to parse AI response as JSON');
  }
}
