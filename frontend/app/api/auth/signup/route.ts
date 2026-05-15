// app/api/auth/signup/route.ts
// POST — Register a new user with hashed password

import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signupSchema } from '@/lib/validations';
import { apiSuccess, apiError } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        apiError(parsed.error.issues[0]?.message ?? 'Invalid input', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        apiError('An account with this email already exists', 'EMAIL_TAKEN'),
        { status: 409 }
      );
    }

    // Hash password with bcrypt (12 rounds)
    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return NextResponse.json(apiSuccess(user), { status: 201 });
  } catch (err) {
    console.error('[signup]', err);
    return NextResponse.json(
      apiError('Internal server error', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}
