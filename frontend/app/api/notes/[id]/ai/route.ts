// app/api/notes/[id]/generate-summary/route.ts
// POST — Generate AI insights for a note using Claude

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateNoteInsights } from '@/lib/groq';
import { apiSuccess, apiError } from '@/lib/utils';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(apiError('Unauthorized', 'UNAUTHORIZED'), { status: 401 });
    }

    const { id } = await params;

    // Fetch and authorize incident
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note || note.userId !== session.user.id) {
      return NextResponse.json(apiError('Note not found', 'NOT_FOUND'), { status: 404 });
    }

    if (!note.content || note.content.trim().length < 10) {
      return NextResponse.json(
        apiError('Note details are too short for analysis (minimum 10 characters)', 'CONTENT_TOO_SHORT'),
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        apiError('AI service is not configured. Missing GROQ_API_KEY.', 'AI_NOT_CONFIGURED'),
        { status: 503 }
      );
    }

    const body: unknown = await _req.json();
    const action = (body as any)?.action || 'summarize';

    // Call Groq API
    const insights = await generateNoteInsights(note.content, note.title);

    // Persist summary to database for history and analytics
    const summary = await prisma.aISummary.create({
      data: {
        noteId: id,
        summary: insights.summary,
        actionItems: insights.action_items,
        suggestedTitle: insights.suggested_title,
        keyTopics: insights.key_topics,
      },
    });

    let result = '';
    if (action === 'summarize') {
      result = insights.summary;
    } else if (action === 'extract') {
      result = insights.action_items.map((item: string) => `- ${item}`).join('\n') || 'No action items found.';
    } else if (action === 'suggest') {
      result = `**Suggested Title:** ${insights.suggested_title}\n\n**Key Topics:** ${insights.key_topics.join(', ')}`;
    } else {
      result = insights.summary;
    }

    return NextResponse.json(apiSuccess({ result }), { status: 201 });
  } catch (err) {
    console.error('[POST /api/notes/:id/generate-summary]', err);
    if (err instanceof SyntaxError) {
      return NextResponse.json(apiError('AI returned invalid response', 'AI_PARSE_ERROR'), { status: 502 });
    }
    return NextResponse.json(apiError('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
}
