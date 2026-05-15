'use client';

// components/notes/NoteEditorView.tsx — Peblo Figma Design

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, Sparkles, Wand2, X, Maximize2, Minimize2, Trash2, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Note } from '@/types';
import { timeAgo } from '@/lib/utils';

interface NoteEditorViewProps {
  note: Note;
}

export default function NoteEditorView({ note }: NoteEditorViewProps) {
  const router = useRouter();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content ?? '');
  const [tags, setTags] = useState(note.tags.map(t => t.name).join(', '));
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date(note.updatedAt));
  
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ type: string; content: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Auto-save logic
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  const saveNote = useCallback(async (isManual = false) => {
    setIsSaving(true);
    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await fetch(`/api/notes/${note.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, tags: tagArray }),
      });
      const data = await res.json();
      if (data.success) {
        setLastSaved(new Date());
        if (isManual) toast.success('Saved');
      }
    } catch { if (isManual) toast.error('Failed to save'); }
    finally { setIsSaving(false); }
  }, [note.id, title, content, tags]);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => saveNote(false), 2000);
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [title, content, tags, saveNote]);

  // AI Functions
  async function callAi(action: string) {
    if (!content.trim()) return toast.error('Note is empty');
    setAiPanelOpen(true);
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch(`/api/notes/${note.id}/ai`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) setAiResult({ type: action, content: data.data.result });
      else toast.error(data.error ?? 'AI request failed');
    } catch { toast.error('Something went wrong'); }
    finally { setAiLoading(false); }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      const res = await fetch(`/api/notes/${note.id}`, { method: 'DELETE' });
      if ((await res.json()).success) { toast.success('Note deleted'); router.push('/dashboard/notes'); }
    } catch { toast.error('Failed to delete note'); }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: 'var(--bg-primary)', position: 'relative'
    }}>
      {/* HEADER */}
      <header style={{
        padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(12,12,26,0.95)', backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => router.push('/dashboard/notes')} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, padding: 8, color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s',
          }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f8fafc'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
             onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#94a3b8'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
          >
            <ArrowLeft size={16} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#475569', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
              {isSaving ? <><Loader2 size={12} className="animate-spin" /> Saving...</> : `Saved ${timeAgo(lastSaved.toISOString())}`}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setPreviewMode(!previewMode)} style={{
            background: 'transparent', border: '1px solid transparent',
            color: previewMode ? '#a78bfa' : '#94a3b8', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', padding: '6px 12px', borderRadius: 8, transition: 'all 0.2s',
          }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'}
             onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
            {previewMode ? 'Edit Mode' : 'Preview'}
          </button>

          <button onClick={() => callAi('summarize')} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(59,130,246,0.1) 100%)',
            border: '1px solid rgba(124,58,237,0.25)', borderRadius: 10,
            color: '#a78bfa', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s', boxShadow: '0 0 20px rgba(124,58,237,0.1)'
          }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(59,130,246,0.15) 100%)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.4)'; }}
             onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(59,130,246,0.1) 100%)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.25)'; }}>
            <Sparkles size={14} /> AI Assist
          </button>
          
          <button onClick={() => saveNote(true)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,58,237,0.4)', transition: 'all 0.2s'
          }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'}
             onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}>
            <Save size={14} /> Save
          </button>

          <button onClick={handleDelete} title="Delete note" style={{
            background: 'none', border: 'none', padding: 8, color: '#475569', cursor: 'pointer',
            borderRadius: 8, transition: 'all 0.2s'
          }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}
             onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#475569'; (e.currentTarget as HTMLElement).style.background = 'none'; }}>
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      {/* EDITOR WORKSPACE */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Main Editor Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', padding: '40px 48px' }}>
            
            {/* Title Input */}
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Note Title"
              style={{
                width: '100%', fontSize: 'clamp(32px, 4vw, 42px)', fontWeight: 800,
                background: 'transparent', border: 'none', color: '#f8fafc',
                outline: 'none', marginBottom: 16, letterSpacing: '-0.02em',
                fontFamily: 'var(--font-inter)'
              }}
            />

            {/* Tags Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 24 }}>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>TAGS</span>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="project, ideas, meeting..."
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8, padding: '6px 12px', color: '#a78bfa', fontSize: 13, outline: 'none',
                  fontFamily: 'var(--font-dm-mono)'
                }}
              />
            </div>

            {/* Content Editor/Preview */}
            {previewMode ? (
              <div className="markdown-preview" style={{ color: '#e2e8f0', lineHeight: 1.8, fontSize: 16 }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || '*Empty note*'}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Start typing your ideas here... Use Markdown for formatting."
                className="markdown-editor"
                style={{ padding: 0 }}
                spellCheck={false}
              />
            )}
          </div>
        </div>

        {/* AI PANEL (Collapsible) */}
        {aiPanelOpen && (
          <div style={{
            width: 380, background: 'rgba(12,12,26,0.95)', borderLeft: '1px solid rgba(124,58,237,0.2)',
            display: 'flex', flexDirection: 'column', boxShadow: '-20px 0 40px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(20px)', zIndex: 40
          }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid rgba(124,58,237,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.05) 0%, transparent 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#a78bfa' }}>
                <Sparkles size={16} />
                <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.02em' }}>Peblo AI</span>
              </div>
              <button onClick={() => setAiPanelOpen(false)} style={{
                background: 'rgba(124,58,237,0.1)', border: 'none', color: '#a78bfa',
                padding: 4, borderRadius: 6, cursor: 'pointer', display: 'flex'
              }}>
                <X size={14} />
              </button>
            </div>

            <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                {[
                  { id: 'summarize', label: 'Summarize', icon: FileText },
                  { id: 'extract', label: 'Action Items', icon: Sparkles },
                  { id: 'suggest', label: 'Improve', icon: Wand2 }
                ].map(tool => (
                  <button key={tool.id} onClick={() => callAi(tool.id)} disabled={aiLoading} style={{
                    padding: '12px 10px', background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12,
                    color: '#e2e8f0', fontSize: 12, fontWeight: 600, cursor: aiLoading ? 'not-allowed' : 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                    gridColumn: tool.id === 'suggest' ? 'span 2' : 'auto'
                  }} onMouseEnter={e => { if(!aiLoading) { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.3)'; (e.currentTarget as HTMLElement).style.color = '#a78bfa'; } }}
                     onMouseLeave={e => { if(!aiLoading) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#e2e8f0'; } }}>
                    <tool.icon size={16} />
                    {tool.label}
                  </button>
                ))}
              </div>

              {aiLoading && (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div className="pulse-ai" style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(124,58,237,0.3)' }}>
                    <Sparkles size={20} style={{ color: '#a78bfa', animation: 'spin 3s linear infinite' }} />
                  </div>
                  <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>AI is thinking...</div>
                </div>
              )}

              {aiResult && !aiLoading && (
                <div className="fade-in" style={{
                  background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.2)',
                  borderRadius: 14, padding: 16
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={12} /> Result
                  </div>
                  <div className="markdown-preview" style={{ fontSize: 13, color: '#f8fafc', lineHeight: 1.6 }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiResult.content}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .markdown-preview h1, .markdown-preview h2, .markdown-preview h3 { color: #f8fafc; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; letter-spacing: -0.01em; }
        .markdown-preview p { margin-bottom: 1em; }
        .markdown-preview ul, .markdown-preview ol { padding-left: 1.5em; margin-bottom: 1em; }
        .markdown-preview li { margin-bottom: 0.5em; }
        .markdown-preview code { background: rgba(255,255,255,0.08); padding: 0.2em 0.4em; border-radius: 4px; font-family: var(--font-dm-mono); font-size: 0.9em; color: #a78bfa; }
        .markdown-preview pre { background: rgba(12,12,26,0.8); padding: 16px; border-radius: 8px; overflow-x: auto; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 1em; }
        .markdown-preview pre code { background: transparent; padding: 0; color: #e2e8f0; }
        .markdown-preview blockquote { border-left: 3px solid #7c3aed; padding-left: 16px; color: #94a3b8; font-style: italic; margin-left: 0; }
        .markdown-preview input[type="checkbox"] { accent-color: #7c3aed; width: 14px; height: 14px; margin-right: 8px; }
      `}} />
    </div>
  );
}
