// src/routes/insights.ts — Productivity analytics dashboard
// GET /api/insights — Returns notes stats, activity, tags, AI usage

import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

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
          select: { id: true, title: true, updatedAt: true, tags: { select: { name: true } } },
          orderBy: { updatedAt: 'desc' },
          take: 5,
        }),
      ]);

    // Build tag frequency map
    const tagCounts: Record<string, number> = {};
    for (const note of notesWithTags) {
      for (const tag of note.tags) {
        tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
      }
    }
    const mostUsedTags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Weekly activity — notes created/edited per day for last 7 days
    const weeklyActivity = await Promise.all(
      Array.from({ length: 7 }, async (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const count = await prisma.note.count({
          where: {
            userId,
            updatedAt: { gte: startOfDay(date), lte: endOfDay(date) },
          },
        });
        return { date: format(date, 'EEE'), notesEdited: count };
      })
    );

    // Writing streak — consecutive days with activity going back from today
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

    res.json({
      success: true,
      data: {
        totalNotes,
        archivedNotes,
        totalAIGenerations: aiSummaryCount,
        mostUsedTags,
        recentlyEdited,
        weeklyActivity,
        streakDays,
      },
    });
  } catch (err) {
    console.error('[GET /insights]', err);
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

export default router;
