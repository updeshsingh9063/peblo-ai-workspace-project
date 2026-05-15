// Peblo Notes — Groq AI Client & Helper Functions
// Uses Groq for blazing fast note analysis

import Groq from 'groq-sdk';
import type { AIInsights } from '@/types';

const getGroqClient = () => {
  return new Groq({
    apiKey: process.env.GROQ_API_KEY || 'dummy-key-for-build',
  });
};

/**
 * Generate AI insights for a note using Groq.
 * Returns a structured JSON object with summary, action items,
 * suggested title, and key topics.
 */
export async function generateNoteInsights(
  content: string,
  title: string
): Promise<AIInsights> {
  const groq = getGroqClient();
  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are Peblo AI — a specialized note analysis assistant. 
Analyze the user's note deeply and respond ONLY with valid JSON matching this exact shape:
{
  "summary": "2-3 sentence summary of the core ideas, main points, and overall context",
  "action_items": ["Actionable step 1", "Actionable step 2"],
  "suggested_title": "A clear, concise title for this note",
  "key_topics": ["topic-1", "topic-2", "topic-3"]
}
Rules:
- summary should be concise and capture the essence of the text
- action_items should be specific tasks or follow-ups mentioned or implied in the text
- suggested_title should be descriptive
- key_topics should be 3-5 keywords or categories
- No markdown, no explanation, just the raw JSON object. Do not wrap in \`\`\`json.`
      },
      {
        role: "user",
        content: `Note Title: ${title}\n\nNote Details:\n${content}`
      }
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content || "{}";

  try {
    const parsed = JSON.parse(text.trim()) as AIInsights;
    return parsed;
  } catch {
    throw new Error('Failed to parse AI response as JSON');
  }
}
