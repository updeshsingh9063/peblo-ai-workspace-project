// lib/env.ts — Typed environment variable accessor
// Lazy access to avoid Edge runtime issues at import time

export const env = {
  get DATABASE_URL() { return process.env.DATABASE_URL ?? ''; },
  get AUTH_SECRET() { return process.env.AUTH_SECRET ?? ''; },
  get ANTHROPIC_API_KEY() { return process.env.ANTHROPIC_API_KEY ?? ''; },
  get NEXTAUTH_URL() { return process.env.NEXTAUTH_URL ?? 'http://localhost:3000'; },
  get NEXT_PUBLIC_APP_URL() { return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'; },
  get NODE_ENV() { return process.env.NODE_ENV ?? 'development'; },
} as const;
