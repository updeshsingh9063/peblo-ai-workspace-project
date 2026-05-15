// app/api/insights/route.ts
// GET — Incident & Diagnostic dashboard data

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(apiError('Unauthorized', 'UNAUTHORIZED'), { status: 401 });
    }

    const userId = session.user.id;

    // Run all queries in parallel for performance
    const [totalNotes, archivedNotes, aiSummaryCount, notesWithTags, recentlyEdited] =
      await Promise.all([
        prisma.note.count({ where: { userId, isArchived: false } }),
        prisma.note.count({ where: { userId, isArchived: true } }),
        prisma.aISummary.count({ where: { note: { userId } } }),
        prisma.note.findMany({
          where: { userId },
          select: { tags: { select: { name: true } } },
        }),
        prisma.note.findMany({
          where: { userId, isArchived: false },
          select: { id: true, title: true, updatedAt: true },
          orderBy: { updatedAt: 'desc' },
          take: 5,
        }),
      ]);

    const tagCounts: Record<string, number> = {};
    for (const note of notesWithTags) {
      for (const tag of note.tags) {
        tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
      }
    }
    const mostUsedTags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // Weekly activity — notes edited per day for last 7 days
    const weeklyActivity = await Promise.all(
      Array.from({ length: 7 }, async (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const count = await prisma.note.count({
          where: {
            userId,
            updatedAt: { gte: startOfDay(date), lte: endOfDay(date) },
          },
        });
        return { date: format(date, 'MMM d'), notesEdited: count };
      })
    );

    // Streak calculation — consecutive days with activity
    let streakDays = 0;
    for (let i = 0; i < 30; i++) {
      const date = subDays(new Date(), i);
      const count = await prisma.note.count({
        where: {
          userId,
          updatedAt: { gte: startOfDay(date), lte: endOfDay(date) },
        },
      });
      if (count > 0) {
        streakDays++;
      } else if (i > 0) {
        break;
      }
    }

    return NextResponse.json(
      apiSuccess({
        totalNotes,
        archivedNotes,
        totalAIGenerations: aiSummaryCount,
        mostUsedTags,
        recentlyEdited,
        weeklyActivity,
        streakDays,
      })
    );
  } catch (err) {
    console.error('[GET /api/insights]', err);
    return NextResponse.json(apiError('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
}
