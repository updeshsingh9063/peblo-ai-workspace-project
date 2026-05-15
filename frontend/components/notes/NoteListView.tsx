'use client';

// components/notes/NoteListView.tsx — Peblo Figma Design

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Search, Plus, Tag, X, Archive, Loader2, FileText } from 'lucide-react';
import NoteCard from './NoteCard';
import type { NoteListItem } from '@/types';

export default function NoteListView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [tagFilter, setTagFilter] = useState(searchParams.get('tag') ?? '');
  const [sort, setSort] = useState<'updatedAt' | 'createdAt' | 'title'>('updatedAt');
  const archived = searchParams.get('archived') === 'true';

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (tagFilter) params.set('tag', tagFilter);
      if (archived) params.set('archived', 'true');
      params.set('sort', sort);
      const res = await fetch(`/api/notes?${params}`);
      const data: { success: boolean; data: { notes: NoteListItem[]; total: number } } = await res.json();
      if (data.success) { setNotes(data.data.notes); setTotal(data.data.total); }
    } catch { toast.error('Failed to load notes'); }
    finally { setLoading(false); }
  }, [query, tagFilter, sort, archived]);

  useEffect(() => {
    const timer = setTimeout(fetchNotes, 300);
    return () => clearTimeout(timer);
  }, [fetchNotes]);

  async function createNote() {
    setCreating(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Note', content: '', tags: [] }),
      });
      const data: { success: boolean; data?: { id: string } } = await res.json();
      if (data.success && data.data?.id) {
        router.push(`/dashboard/notes/${data.data.id}`);
        toast.success('Note created ✦');
      }
    } catch { toast.error('Failed to create note'); }
    finally { setCreating(false); }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(12,12,26,0.95)', flexShrink: 0, backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
              {archived ? '✓ Archived Notes' : '✦ All Notes'}
            </h1>
            <p style={{ color: '#334155', fontSize: 13, margin: '4px 0 0' }}>
              {total} {total === 1 ? 'note' : 'notes'}{tagFilter ? ` tagged #${tagFilter}` : ''}
            </p>
          </div>
          <button
            id="create-note-btn"
            onClick={createNote}
            disabled={creating}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 10,
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: 'white', border: 'none', fontSize: 13, fontWeight: 700,
              cursor: creating ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
              opacity: creating ? 0.7 : 1, transition: 'all 0.2s',
            }}
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            New Note
          </button>
        </div>

        {/* Search + Filters */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={14} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: '#334155', pointerEvents: 'none',
            }} />
            <input
              id="search-notes"
              type="text"
              placeholder="Search notes..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                width: '100%', padding: '9px 36px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 9, color: '#f8fafc', fontSize: 13, outline: 'none', fontFamily: 'inherit',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#334155',
                display: 'flex', padding: 0,
              }}><X size={13} /></button>
            )}
          </div>

          {tagFilter && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
              background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: 9, fontSize: 13, color: '#a78bfa', fontWeight: 600,
            }}>
              <Tag size={12} />#{tagFilter}
              <button onClick={() => setTagFilter('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex' }}>
                <X size={12} />
              </button>
            </div>
          )}

          <select
            value={sort}
            onChange={e => setSort(e.target.value as typeof sort)}
            style={{
              padding: '9px 12px', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)', borderRadius: 9,
              color: '#94a3b8', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
            }}
          >
            <option value="updatedAt">Last updated</option>
            <option value="createdAt">Date created</option>
            <option value="title">Title A-Z</option>
          </select>

          <button
            onClick={() => router.push(archived ? '/dashboard/notes' : '/dashboard/notes?archived=true')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px',
              background: archived ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${archived ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 9, color: archived ? '#a78bfa' : '#64748b',
              fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
              transition: 'all 0.2s',
            }}
          >
            <Archive size={13} />
            {archived ? 'View Active' : 'View Archived'}
          </button>
        </div>
      </div>

      {/* Notes grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 16 }}>
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className="skeleton" style={{ height: 160, borderRadius: 14 }} />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <EmptyState query={query} archived={archived} onCreate={createNote} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 16 }}>
            {notes.map(note => (
              <NoteCard key={note.id} note={note} onTagClick={tag => setTagFilter(tag)} onArchive={fetchNotes} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ query, archived, onCreate }: { query: string; archived: boolean; onCreate: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20, margin: '0 auto 20px',
        background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
      }}>
        <FileText size={32} style={{ color: '#7c3aed' }} />
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>
        {query ? `No notes matching "${query}"` : archived ? 'No archived notes' : 'No notes yet'}
      </h2>
      <p style={{ color: '#334155', fontSize: 14, marginBottom: 28 }}>
        {query ? 'Try a different search term' : archived ? 'Archived notes will appear here' : 'Create your first note to get started'}
      </p>
      {!query && !archived && (
        <button onClick={onCreate} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '12px 28px', borderRadius: 12,
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          color: 'white', border: 'none', fontSize: 14, fontWeight: 700,
          cursor: 'pointer', boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
          fontFamily: 'inherit',
        }}>
          <Plus size={16} /> Create first note
        </button>
      )}
    </div>
  );
}
