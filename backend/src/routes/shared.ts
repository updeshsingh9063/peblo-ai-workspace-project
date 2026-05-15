// src/routes/shared.ts — Public note view (no auth required)
// GET /api/shared/:shareId — Fetch a publicly shared note

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/:shareId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { shareId } = req.params;

    const note = await prisma.note.findUnique({
      where: { shareId },
      include: {
        user: { select: { name: true } },
        tags: { select: { id: true, name: true } },
      },
    });

    if (!note || !note.isPublic) {
      res.status(404).json({ success: false, error: 'Note not found or not publicly shared', code: 'NOT_FOUND' });
      return;
    }

    // Return public-safe fields only
    res.json({
      success: true,
      data: {
        id: note.id,
        title: note.title,
        content: note.content,
        tags: note.tags,
        author: note.user.name,
        updatedAt: note.updatedAt,
        createdAt: note.createdAt,
      },
    });
  } catch (err) {
    console.error('[GET /shared/:shareId]', err);
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

export default router;
