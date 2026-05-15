// app/api/notes/[id]/route.ts
// GET    — Fetch a single note
// PATCH  — Update note (title, content, tags, isArchived, isPublic)
// DELETE — Hard delete a note

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateNoteSchema } from '@/lib/validations';
import { apiSuccess, apiError } from '@/lib/utils';

async function getAuthorizedNote(id: string, userId: string) {
  const note = await prisma.note.findUnique({
    where: { id },
    include: {
      tags: { select: { id: true, name: true } },
      aiSummaries: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });
  if (!note) return null;
  if (note.userId !== userId) return null;
  return note;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(apiError('Unauthorized', 'UNAUTHORIZED'), { status: 401 });
    }
    const { id } = await params;
    const note = await getAuthorizedNote(id, session.user.id);
    if (!note) {
      return NextResponse.json(apiError('Incident not found', 'NOT_FOUND'), { status: 404 });
    }
    return NextResponse.json(apiSuccess(note));
  } catch (err) {
    console.error('[GET /api/notes/:id]', err);
    return NextResponse.json(apiError('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(apiError('Unauthorized', 'UNAUTHORIZED'), { status: 401 });
    }

    const { id } = await params;
    const existing = await getAuthorizedNote(id, session.user.id);
    if (!existing) {
      return NextResponse.json(apiError('Incident not found', 'NOT_FOUND'), { status: 404 });
    }

    const body: unknown = await req.json();
    const parsed = updateNoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(apiError(parsed.error.issues[0]?.message ?? 'Invalid input', 'VALIDATION_ERROR'), { status: 400 });
    }

    const { title, content, isArchived, isPublic, tags } = parsed.data;

    // Handle tag updates if provided — upsert each tag
    let dbTags: { id: string; name: string }[] | undefined;
    if (tags !== undefined) {
      dbTags = await Promise.all(
        tags.map(async (name: string) => {
          const normalized = name.toLowerCase().trim();
          return await prisma.tag.upsert({
            where: { name: normalized },
            update: {},
            create: { name: normalized },
          });
        })
      );
    }

    const note = await prisma.note.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(isArchived !== undefined && { isArchived }),
        ...(isPublic !== undefined && { isPublic }),
        ...(dbTags && {
          tagIds: dbTags.map((t) => t.id),
        }),
      },
      include: {
        tags: { select: { id: true, name: true } },
        aiSummaries: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    return NextResponse.json(apiSuccess(note));
  } catch (err) {
    console.error('[PATCH /api/notes/:id]', err);
    return NextResponse.json(apiError('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(apiError('Unauthorized', 'UNAUTHORIZED'), { status: 401 });
    }
    const { id } = await params;
    const existing = await getAuthorizedNote(id, session.user.id);
    if (!existing) {
      return NextResponse.json(apiError('Incident not found', 'NOT_FOUND'), { status: 404 });
    }

    await prisma.note.delete({ where: { id } });
    return NextResponse.json(apiSuccess({ deleted: true }));
  } catch (err) {
    console.error('[DELETE /api/notes/:id]', err);
    return NextResponse.json(apiError('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
}
