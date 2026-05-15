// app/api/notes/[id]/share/route.ts
// PATCH — Toggle public sharing, auto-generate shareId, returns share URL

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';
import { randomBytes } from 'crypto';

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(apiError('Unauthorized', 'UNAUTHORIZED'), { status: 401 });
    }

    const { id } = await params;
    const note = await prisma.note.findUnique({ where: { id } });

    if (!note || note.userId !== session.user.id) {
      return NextResponse.json(apiError('Note not found', 'NOT_FOUND'), { status: 404 });
    }

    // Toggle public state; generate shareId if making public and none exists
    const isPublic = !note.isPublic;
    const shareId = note.shareId ?? randomBytes(8).toString('hex');

    const updated = await prisma.note.update({
      where: { id },
      data: { isPublic, shareId },
      select: { id: true, isPublic: true, shareId: true },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const shareUrl = updated.isPublic && updated.shareId
      ? `${appUrl}/shared/${updated.shareId}`
      : null;

    return NextResponse.json(apiSuccess({ ...updated, shareUrl }));
  } catch (err) {
    console.error('[PATCH /api/notes/:id/share]', err);
    return NextResponse.json(apiError('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
}
