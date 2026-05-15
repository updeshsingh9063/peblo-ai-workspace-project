// Peblo Notes — Shared TypeScript Interfaces

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
}

export interface AISummary {
  id: string;
  noteId: string;
  summary: string;
  actionItems: string[];
  suggestedTitle?: string | null;
  keyTopics: string[];
  createdAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  isArchived: boolean;
  isPublic: boolean;
  shareId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  tags: Tag[];
  aiSummaries?: AISummary[];
}

export interface NoteListItem {
  id: string;
  title: string;
  content: string;
  isArchived: boolean;
  isPublic: boolean;
  shareId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  tags: Tag[];
  _count?: { aiSummaries: number };
}

export interface InsightsData {
  totalNotes: number;
  archivedNotes: number;
  totalAIGenerations: number;
  mostUsedTags: Array<{ name: string; count: number }>;
  recentlyEdited: Array<{ id: string; title: string; updatedAt: Date }>;
  weeklyActivity: Array<{ date: string; notesEdited: number }>;
  streakDays: number;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  code: string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface AIInsights {
  summary: string;
  action_items: string[];
  suggested_title: string;
  key_topics: string[];
}
