// app/shared/[shareId]/page.tsx — Public read-only note view (no auth required)

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const note = await prisma.note.findUnique({ where: { shareId } });
  if (!note || !note.isPublic) return { title: 'Note Not Found — Peblo' };
  return {
    title: `${note.title} — Peblo`,
    description: note.content.slice(0, 160),
  };
}

export default async function SharedNotePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;

  const note = await prisma.note.findUnique({
    where: { shareId },
    include: {
      user: { select: { name: true } },
      tags: { select: { id: true, name: true } },
    },
  });

  if (!note || !note.isPublic) notFound();

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top bar */}
      <div style={{
        padding: '14px 24px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
        }}>
          <ShieldAlert size={16} color="white" />
        </div>
        <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>RESOLVE AI</span>
        <span style={{
          marginLeft: 8, padding: '3px 10px', background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444', borderRadius: 999, fontSize: 11, fontWeight: 600,
          border: '1px solid rgba(239, 68, 68, 0.2)',
        }}>
          Shared Incident Report
        </span>
        <div style={{ flex: 1 }} />
        <Link href="/signup" style={{
          padding: '7px 16px', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
          color: 'white', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600,
          boxShadow: '0 2px 10px rgba(239, 68, 68, 0.3)',
        }}>
          Try Resolve AI free →
        </Link>
      </div>

      {/* Note content */}
      <div style={{
        flex: 1, maxWidth: 760, width: '100%',
        margin: '0 auto', padding: '48px 32px',
      }}>
        {/* Meta */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontSize: 36, fontWeight: 800, color: 'var(--text-primary)',
            letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 12,
          }}>
            {note.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              By <strong style={{ color: 'var(--text-secondary)' }}>{note.user.name}</strong>
            </span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Updated {formatDate(note.updatedAt, 'MMM d, yyyy')}
            </span>
            {note.tags.length > 0 && (
              <>
                <span style={{ color: 'var(--border)' }}>·</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {note.tags.map((tag: { id: string; name: string }) => (
                    <span key={tag.id} style={{
                      padding: '3px 10px', background: 'var(--accent-muted)',
                      color: 'var(--accent-hover)', borderRadius: 999,
                      fontSize: 11, fontWeight: 600,
                      border: '1px solid rgba(124,110,230,0.2)',
                    }}>
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border-subtle)', marginBottom: 36 }} />

        {/* Markdown content */}
        <div className="markdown-preview" style={{
          color: 'var(--text-primary)', lineHeight: 1.8, fontSize: 16,
        }}>
          {note.content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {note.content}
            </ReactMarkdown>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>This note has no content.</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        padding: '24px 32px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
          ✨ Analyzed with{' '}
          <Link href="/" style={{ color: 'var(--accent-hover)', textDecoration: 'none', fontWeight: 600 }}>
            Resolve AI
          </Link>
          {' '}— Advanced Incident Resolution Platform
        </p>
      </footer>
    </main>
  );
}
