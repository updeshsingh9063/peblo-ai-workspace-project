'use client';

// components/notes/NoteCard.tsx — Peblo Figma Design

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Archive, ArchiveRestore, Tag, Clock, Loader2 } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import type { NoteListItem } from '@/types';

interface NoteCardProps {
  note: NoteListItem;
  onTagClick: (tag: string) => void;
  onArchive: () => void;
}

export default function NoteCard({ note, onTagClick, onArchive }: NoteCardProps) {
  const router = useRouter();
  const [archiving, setArchiving] = useState(false);

  async function handleArchive(e: React.MouseEvent) {
    e.stopPropagation();
    setArchiving(true);
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: !note.isArchived }),
      });
      const data: { success: boolean } = await res.json();
      if (data.success) {
        toast.success(note.isArchived ? 'Note restored ✦' : 'Note archived');
        onArchive();
      }
    } catch { toast.error('Failed to update note'); }
    finally { setArchiving(false); }
  }

  const preview = note.content
    ?.replace(/#{1,6}\s/g, '')
    .replace(/[*_`]/g, '')
    .replace(/\n/g, ' ')
    .slice(0, 120);

  return (
    <div
      className="note-card"
      onClick={() => router.push(`/dashboard/notes/${note.id}`)}
      style={{ position: 'relative' }}
    >
      {/* Archive indicator */}
      {note.isArchived && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)',
          borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700,
          color: '#22d3ee', letterSpacing: '0.08em',
        }}>ARCHIVED</div>
      )}

      {/* Title */}
      <h3 style={{
        fontSize: 15, fontWeight: 700, color: '#f8fafc',
        marginBottom: 8, paddingRight: note.isArchived ? 70 : 0,
        letterSpacing: '-0.01em', lineHeight: 1.3,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {note.title || 'Untitled Note'}
      </h3>

      {/* Preview */}
      {preview && (
        <p style={{
          fontSize: 13, color: '#475569', lineHeight: 1.6,
          marginBottom: 14, position: 'relative', zIndex: 1,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {preview}
        </p>
      )}

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14, position: 'relative', zIndex: 1 }}>
          {note.tags.slice(0, 4).map(tag => (
            <span
              key={tag.name}
              className="tag-badge"
              onClick={e => { e.stopPropagation(); onTagClick(tag.name); }}
            >
              #{tag.name}
            </span>
          ))}
          {note.tags.length > 4 && (
            <span style={{ fontSize: 11, color: '#334155', padding: '3px 6px' }}>+{note.tags.length - 4}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#334155', fontSize: 11 }}>
          <Clock size={11} />
          <span>{timeAgo(note.updatedAt)}</span>
        </div>
        <button
          onClick={handleArchive}
          disabled={archiving}
          title={note.isArchived ? 'Restore note' : 'Archive note'}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#334155', display: 'flex', alignItems: 'center', padding: 4,
            borderRadius: 6, transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#a78bfa'; (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.1)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#334155'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
        >
          {archiving ? <Loader2 size={13} className="animate-spin" /> : note.isArchived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
        </button>
      </div>
    </div>
  );
}
