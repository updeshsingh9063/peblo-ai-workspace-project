// Peblo Notes — Anthropic AI Client & Helper Functions
// Uses Claude claude-sonnet-4-20250514 for intelligent note analysis

import Anthropic from '@anthropic-ai/sdk';
import type { AIInsights } from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate AI insights for a note using Claude.
 * Returns a structured JSON object with summary, action items,
 * suggested title, and key topics.
 */
export async function generateNoteInsights(
  content: string,
  title: string
): Promise<AIInsights> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `You are Resolve AI — a specialized technical incident analysis assistant. 
Analyze the application error or system incident report deeply and respond ONLY with valid JSON matching this exact shape:
{
  "summary": "2-3 sentence diagnostic summary of the error, its likely root cause, and impact",
  "action_items": ["Resolution step 1", "Resolution step 2"],
  "suggested_title": "A clear, technical title for this incident (e.g. ERR-502: Auth Service Latency Spike)",
  "key_topics": ["error-type", "affected-service", "severity"]
}
Rules:
- summary should be professional and diagnostic
- action_items should be specific technical steps to resolve the error
- suggested_title should be descriptive and technical
- key_topics should be 3-5 technical categories or services
- No markdown, no explanation, just the JSON object`,
    messages: [
      {
        role: 'user',
        content: `Incident Title: ${title}\n\nIncident Details:\n${content}`,
      },
    ],
  });

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '{}';

  try {
    const parsed = JSON.parse(text.trim()) as AIInsights;
    return parsed;
  } catch {
    throw new Error('Failed to parse AI response as JSON');
  }
}

/**
 * Stream AI insights using Server-Sent Events for real-time UX.
 * Returns a ReadableStream that can be piped to the response.
 */
export async function streamNoteInsights(
  content: string,
  title: string
): Promise<ReadableStream> {
  const stream = client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `You are Resolve AI — a specialized technical incident analysis assistant. Analyze the incident report and respond ONLY with valid JSON:
{
  "summary": "2-3 sentence diagnostic summary",
  "action_items": ["resolution1", "resolution2"],
  "suggested_title": "A clear technical title",
  "key_topics": ["error-type", "affected-service", "severity"]
}`,
    messages: [
      {
        role: 'user',
        content: `Incident Title: ${title}\n\nIncident Details:\n${content}`,
      },
    ],
  });

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`
            )
          );
        }
      }
      controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}
