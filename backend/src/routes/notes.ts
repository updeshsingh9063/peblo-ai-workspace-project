// src/routes/notes.ts — Full CRUD for notes
// GET    /api/notes        — list with search, filter, sort, pagination
// POST   /api/notes        — create a note
// GET    /api/notes/:id    — fetch a single note
// PATCH  /api/notes/:id    — update note
// DELETE /api/notes/:id    — delete note
// POST   /api/notes/:id/generate-summary — AI summarization
// POST   /api/notes/:id/share            — toggle public sharing

import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { generateNoteInsights } from '../lib/groq';
import { requireAuth, AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

const router = Router();

// All notes routes require authentication
router.use(requireAuth);

const createNoteSchema = z.object({
  title: z.string().min(1).max(300).default('Untitled Note'),
  content: z.string().default(''),
  tags: z.array(z.string().min(1).max(50)).default([]),
});

const updateNoteSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  content: z.string().optional(),
  tags: z.array(z.string().min(1).max(50)).optional(),
  isArchived: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

// Helper: upsert tags and return their DB records
async function upsertTags(tagNames: string[]) {
  return Promise.all(
    tagNames.map(async (name) => {
      const normalized = name.toLowerCase().trim();
      return prisma.tag.upsert({
        where: { name: normalized },
        update: {},
        create: { name: normalized },
      });
    })
  );
}

// GET /api/notes — List notes with search, tag filter, sort, pagination
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const q = req.query.q as string | undefined;
    const tag = req.query.tag as string | undefined;
    const archived = req.query.archived === 'true';
    const sort = (req.query.sort as string) || 'updatedAt';
    const order = (req.query.order as string) === 'asc' ? 'asc' : 'desc';
    const page = Math.max(1, parseInt((req.query.page as string) || '1'));
    const limit = Math.min(50, parseInt((req.query.limit as string) || '20'));
    const skip = (page - 1) * limit;

    const validSorts = ['updatedAt', 'createdAt', 'title'];
    const sortField = validSorts.includes(sort) ? sort : 'updatedAt';

    const baseWhere = {
      userId,
      isArchived: archived,
      ...(tag ? { tags: { some: { name: tag.toLowerCase() } } } : {}),
    };

    let notes;
    let total: number;

    if (q && q.trim()) {
      const searchTerm = q.toLowerCase().trim();
      const allNotes = await prisma.note.findMany({
        where: baseWhere,
        select: {
          id: true, title: true, content: true, isArchived: true,
          isPublic: true, shareId: true, createdAt: true, updatedAt: true,
          tags: { select: { id: true, name: true } },
          _count: { select: { aiSummaries: true } },
        },
        orderBy: { [sortField]: order },
      });

      const filtered = allNotes.filter(
        (n) => n.title.toLowerCase().includes(searchTerm) || n.content.toLowerCase().includes(searchTerm)
      );
      total = filtered.length;
      notes = filtered.slice(skip, skip + limit);
    } else {
      [notes, total] = await Promise.all([
        prisma.note.findMany({
          where: baseWhere,
          select: {
            id: true, title: true, content: true, isArchived: true,
            isPublic: true, shareId: true, createdAt: true, updatedAt: true,
            tags: { select: { id: true, name: true } },
            _count: { select: { aiSummaries: true } },
          },
          orderBy: { [sortField]: order },
          take: limit,
          skip,
        }),
        prisma.note.count({ where: baseWhere }),
      ]);
    }

    res.json({ success: true, data: { notes, total, page, limit } });
  } catch (err) {
    console.error('[GET /notes]', err);
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// POST /api/notes — Create a new note
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = createNoteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input', code: 'VALIDATION_ERROR' });
      return;
    }

    const { title, content, tags } = parsed.data;
    const userId = req.user!.id;

    const dbTags = await upsertTags(tags);
    const note = await prisma.note.create({
      data: {
        title, content, userId,
        tags: { connect: dbTags.map((t) => ({ id: t.id })) },
      },
      include: { tags: { select: { id: true, name: true } } },
    });

    res.status(201).json({ success: true, data: note });
  } catch (err) {
    console.error('[POST /notes]', err);
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// GET /api/notes/:id — Fetch a single note
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const note = await prisma.note.findUnique({
      where: { id: req.params.id },
      include: {
        tags: { select: { id: true, name: true } },
        aiSummaries: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!note || note.userId !== req.user!.id) {
      res.status(404).json({ success: false, error: 'Note not found', code: 'NOT_FOUND' });
      return;
    }

    res.json({ success: true, data: note });
  } catch (err) {
    console.error('[GET /notes/:id]', err);
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// PATCH /api/notes/:id — Update a note (title, content, tags, archive, public)
router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.user!.id) {
      res.status(404).json({ success: false, error: 'Note not found', code: 'NOT_FOUND' });
      return;
    }

    const parsed = updateNoteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input', code: 'VALIDATION_ERROR' });
      return;
    }

    const { title, content, tags, isArchived, isPublic } = parsed.data;

    let dbTags: { id: string }[] | undefined;
    if (tags !== undefined) {
      dbTags = await upsertTags(tags);
    }

    const note = await prisma.note.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(isArchived !== undefined && { isArchived }),
        ...(isPublic !== undefined && { isPublic }),
        ...(dbTags && { tagIds: dbTags.map((t) => t.id) }),
      },
      include: {
        tags: { select: { id: true, name: true } },
        aiSummaries: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    res.json({ success: true, data: note });
  } catch (err) {
    console.error('[PATCH /notes/:id]', err);
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// DELETE /api/notes/:id — Delete a note
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.user!.id) {
      res.status(404).json({ success: false, error: 'Note not found', code: 'NOT_FOUND' });
      return;
    }

    await prisma.note.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    console.error('[DELETE /notes/:id]', err);
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// POST /api/notes/:id/generate-summary — AI summarization via Groq
router.post('/:id/generate-summary', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note || note.userId !== req.user!.id) {
      res.status(404).json({ success: false, error: 'Note not found', code: 'NOT_FOUND' });
      return;
    }

    if (!note.content || note.content.trim().length < 10) {
      res.status(400).json({ success: false, error: 'Note content is too short for AI analysis (minimum 10 characters)', code: 'CONTENT_TOO_SHORT' });
      return;
    }

    if (!process.env.GROQ_API_KEY) {
      res.status(503).json({ success: false, error: 'AI service not configured. Add GROQ_API_KEY to .env', code: 'AI_NOT_CONFIGURED' });
      return;
    }

    const insights = await generateNoteInsights(note.content, note.title);

    const summary = await prisma.aISummary.create({
      data: {
        noteId: note.id,
        summary: insights.summary,
        actionItems: insights.action_items,
        suggestedTitle: insights.suggested_title,
        keyTopics: insights.key_topics,
      },
    });

    res.status(201).json({ success: true, data: summary });
  } catch (err) {
    console.error('[POST /notes/:id/generate-summary]', err);
    if (err instanceof SyntaxError) {
      res.status(502).json({ success: false, error: 'AI returned an invalid response', code: 'AI_PARSE_ERROR' });
      return;
    }
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// POST /api/notes/:id/share — Toggle public sharing, generate shareId
router.post('/:id/share', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note || note.userId !== req.user!.id) {
      res.status(404).json({ success: false, error: 'Note not found', code: 'NOT_FOUND' });
      return;
    }

    const makePublic = !note.isPublic;
    const shareId = makePublic && !note.shareId ? crypto.randomBytes(8).toString('hex') : note.shareId;

    const updated = await prisma.note.update({
      where: { id: note.id },
      data: { isPublic: makePublic, shareId },
      select: { id: true, isPublic: true, shareId: true },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[POST /notes/:id/share]', err);
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

export default router;
