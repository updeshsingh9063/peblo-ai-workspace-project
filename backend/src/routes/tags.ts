// src/routes/tags.ts — Tags endpoint
// GET /api/tags — Get all tags used by the authenticated user

import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get all tags used in this user's notes
    const notes = await prisma.note.findMany({
      where: { userId },
      select: { tags: { select: { id: true, name: true } } },
    });

    const tagMap = new Map<string, { id: string; name: string; count: number }>();
    for (const note of notes) {
      for (const tag of note.tags) {
        if (tagMap.has(tag.id)) {
          tagMap.get(tag.id)!.count++;
        } else {
          tagMap.set(tag.id, { ...tag, count: 1 });
        }
      }
    }

    const tags = Array.from(tagMap.values()).sort((a, b) => b.count - a.count);
    res.json({ success: true, data: tags });
  } catch (err) {
    console.error('[GET /tags]', err);
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

export default router;
