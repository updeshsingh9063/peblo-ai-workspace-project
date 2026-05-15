// app/api/notes/route.ts
// GET  — List notes for authenticated user (with search, tag filter, sort)
// POST — Create a new note

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNoteSchema, noteQuerySchema } from '@/lib/validations';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(apiError('Unauthorized', 'UNAUTHORIZED'), { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const query = noteQuerySchema.safeParse(Object.fromEntries(searchParams));
    if (!query.success) {
      return NextResponse.json(apiError('Invalid query params', 'VALIDATION_ERROR'), { status: 400 });
    }

    const { q, tag, archived, sort, order, page, limit } = query.data;
    const take = Math.min(parseInt(limit), 50);
    const skip = (parseInt(page) - 1) * take;
    const showArchived = archived === 'true';

    // Build where clause — MongoDB does NOT support mode:'insensitive' in contains
    // Use regex-based filtering via Prisma's string filter workaround
    const baseWhere = {
      userId: session.user.id,
      isArchived: showArchived,
      ...(tag ? { tags: { some: { name: tag.toLowerCase() } } } : {}),
    };

    // Fetch all for text search (MongoDB full-text needs Atlas; use JS filter for simple case)
    let notes;
    let total: number;

    if (q && q.trim()) {
      const searchTerm = q.toLowerCase().trim();
      // Fetch broader set and filter in JS for MongoDB compatibility
      const allNotes = await prisma.note.findMany({
        where: baseWhere,
        select: {
          id: true,
          title: true,
          content: true,
          isArchived: true,
          isPublic: true,
          shareId: true,
          createdAt: true,
          updatedAt: true,
          tags: { select: { id: true, name: true } },
          _count: { select: { aiSummaries: true } },
        },
        orderBy: { [sort]: order },
      });
      const filtered = allNotes.filter(
        (n) =>
          n.title.toLowerCase().includes(searchTerm) ||
          n.content.toLowerCase().includes(searchTerm)
      );
      total = filtered.length;
      notes = filtered.slice(skip, skip + take);
    } else {
      [notes, total] = await Promise.all([
        prisma.note.findMany({
          where: baseWhere,
          select: {
            id: true,
            title: true,
            content: true,
            isArchived: true,
            isPublic: true,
            shareId: true,
            createdAt: true,
            updatedAt: true,
            tags: { select: { id: true, name: true } },
            _count: { select: { aiSummaries: true } },
          },
          orderBy: { [sort]: order },
          take,
          skip,
        }),
        prisma.note.count({ where: baseWhere }),
      ]);
    }

    return NextResponse.json(apiSuccess({ notes, total, page: parseInt(page), limit: take }));
  } catch (err) {
    console.error('[GET /api/notes]', err);
    return NextResponse.json(apiError('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(apiError('Unauthorized', 'UNAUTHORIZED'), { status: 401 });
    }

    const body: unknown = await req.json();
    const parsed = createNoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(apiError(parsed.error.issues[0]?.message ?? 'Invalid input', 'VALIDATION_ERROR'), { status: 400 });
    }

    const { title, content, tags } = parsed.data;
    const userId = session.user.id;

    // Upsert tags
    const dbTags = await Promise.all(
      tags.map(async (name: string) => {
        return await prisma.tag.upsert({
          where: { name: name.toLowerCase().trim() },
          update: {},
          create: { name: name.toLowerCase().trim() },
        });
      })
    );

    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId,
        tags: {
          connect: dbTags.map((t) => ({ id: t.id })),
        },
      },
      include: {
        tags: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(apiSuccess(note), { status: 201 });
  } catch (err) {
    console.error('[POST /api/notes]', err);
    return NextResponse.json(apiError('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
}
