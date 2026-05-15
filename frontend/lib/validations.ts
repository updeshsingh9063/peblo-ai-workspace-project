// Peblo Notes — Zod Validation Schemas

import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createNoteSchema = z.object({
  title: z.string().max(255).optional().default('NEW INCIDENT'),
  content: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
});

export const updateNoteSchema = z.object({
  title: z.string().max(255).optional(),
  content: z.string().optional(),
  isArchived: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export const noteQuerySchema = z.object({
  q: z.string().optional(),
  tag: z.string().optional(),
  archived: z.string().optional(),
  sort: z.enum(['updatedAt', 'createdAt', 'title']).optional().default('updatedAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
});

export const tagQuerySchema = z.object({
  q: z.string().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
