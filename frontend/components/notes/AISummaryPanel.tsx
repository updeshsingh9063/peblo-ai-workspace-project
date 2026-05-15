'use client';

// components/notes/AISummaryPanel.tsx — AI-powered insights panel

import { useState } from 'react';
import { toast } from 'sonner';
import { Sparkles, X, CheckSquare, Square, ShieldAlert, Wand2, RefreshCw, Clock } from 'lucide-react';
import type { AISummary } from '@/types';
import { timeAgo } from '@/lib/utils';

interface AISummaryPanelProps {
  noteId: string;
  noteContent: string;
  latestSummary: AISummary | null;
  onSummaryGenerated: (summary: AISummary) => void;
  onUseSuggestedTitle: (title: string) => void;
  onClose: () => void;
}

export default function AISummaryPanel({
  noteId,
  noteContent,
  latestSummary,
  onSummaryGenerated,
  onUseSuggestedTitle,
  onClose,
}: AISummaryPanelProps) {
  const [loading, setLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  async function generateInsights() {
    if (!noteContent || noteContent.trim().length < 10) {
      toast.error('Provide more incident details for accurate AI analysis');
      return;
    }

    setLoading(true);
    setCheckedItems(new Set());

    try {
      const res = await fetch(`/api/notes/${noteId}/generate-summary`, {
        method: 'POST',
      });
      const data: { success: boolean; data: AISummary; error?: string } = await res.json();

      if (data.success) {
        onSummaryGenerated(data.data);
        toast.success('Root cause analysis complete! 🔍');
      } else {
        toast.error(data.error ?? 'Failed to analyze error');
      }
    } catch {
      toast.error('Failed to connect to Analysis service');
    } finally {
      setLoading(false);
    }
  }

  function toggleItem(index: number) {
    const next = new Set(checkedItems);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setCheckedItems(next);
  }

  return (
    <div
      className="fade-in"
      style={{
        width: 360,
        minWidth: 360,
        height: '100%',
        borderLeft: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Panel header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(239, 68, 68, 0.3)',
        }}>
          <Sparkles size={15} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
            Root Cause Analysis
          </h2>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
            Powered by Claude claude-sonnet-4-20250514
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', display: 'flex', padding: 4, borderRadius: 6,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Panel content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {!latestSummary && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              Analyze Root Cause
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
              Claude will analyze your incident report and provide a diagnostic summary, resolution steps, and a suggested title.
            </p>
            <button
              id="generate-ai-btn"
              className="btn-accent"
              onClick={generateInsights}
              style={{
                padding: '10px 20px',
                fontSize: 14,
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              }}
            >
              <Sparkles size={15} />
              Run AI Diagnostics
            </button>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div
              style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                animation: 'pulse 2s ease-in-out infinite',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
              }}
            >
              <Sparkles size={24} color="white" />
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>
              Claude is analyzing the incident...
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              This usually takes 5-10 seconds
            </p>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 20 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--accent)',
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        {latestSummary && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="fade-in">
            {/* Timestamp */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 11 }}>
              <Clock size={11} />
              Generated {timeAgo(latestSummary.createdAt)}
            </div>

            {/* Summary */}
            <div className="ai-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <ShieldAlert size={15} style={{ color: '#ef4444' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Diagnostic Summary</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                {latestSummary.summary}
              </p>
            </div>

            {/* Suggested title */}
            {latestSummary.suggestedTitle && (
              <div className="ai-panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                  <Wand2 size={15} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Suggested Title</span>
                </div>
                <div style={{
                  fontSize: 14, color: 'var(--text-primary)', fontWeight: 600,
                  padding: '8px 12px', background: 'var(--surface)',
                  borderRadius: 8, marginBottom: 10, lineHeight: 1.4,
                  border: '1px solid var(--border)',
                }}>
                  &ldquo;{latestSummary.suggestedTitle}&rdquo;
                </div>
                <button
                  className="btn-ghost"
                  onClick={() => onUseSuggestedTitle(latestSummary.suggestedTitle!)}
                  style={{ width: '100%', justifyContent: 'center', padding: '8px 12px', fontSize: 13 }}
                >
                  Use this title
                </button>
              </div>
            )}

            {/* Action Items */}
            {latestSummary.actionItems.length > 0 && (
              <div className="ai-panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                  <CheckSquare size={15} style={{ color: 'var(--success)' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Resolution Steps
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {checkedItems.size}/{latestSummary.actionItems.length} resolved
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {latestSummary.actionItems.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => toggleItem(i)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer',
                        padding: '6px 8px', borderRadius: 6, transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      {checkedItems.has(i)
                        ? <CheckSquare size={15} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 1 }} />
                        : <Square size={15} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 1 }} />
                      }
                      <span style={{
                        fontSize: 13, color: checkedItems.has(i) ? 'var(--text-muted)' : 'var(--text-secondary)',
                        textDecoration: checkedItems.has(i) ? 'line-through' : 'none',
                        lineHeight: 1.5,
                      }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Topics */}
            {latestSummary.keyTopics.length > 0 && (
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Key Topics
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {latestSummary.keyTopics.map((topic) => (
                    <span key={topic} className="tag-badge" style={{ cursor: 'default' }}>
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Regenerate */}
            <button
              onClick={generateInsights}
              className="btn-ghost"
              style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
            >
              <RefreshCw size={13} />
              Re-run analysis
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
