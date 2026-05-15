// app/api/tags/route.ts
// GET — List all tags (with optional search filter)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { tagQuerySchema } from '@/lib/validations';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(apiError('Unauthorized', 'UNAUTHORIZED'), { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const query = tagQuerySchema.safeParse(Object.fromEntries(searchParams));
    if (!query.success) {
      return NextResponse.json(apiError('Invalid query', 'VALIDATION_ERROR'), { status: 400 });
    }

    const { q } = query.data;

    const tags = await prisma.tag.findMany({
      where: q ? { name: { contains: q, mode: 'insensitive' } } : undefined,
      select: {
        id: true,
        name: true,
        _count: { select: { notes: true } },
      },
      orderBy: { notes: { _count: 'desc' } },
      take: 30,
    });

    return NextResponse.json(apiSuccess(tags));
  } catch (err) {
    console.error('[GET /api/tags]', err);
    return NextResponse.json(apiError('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
}
