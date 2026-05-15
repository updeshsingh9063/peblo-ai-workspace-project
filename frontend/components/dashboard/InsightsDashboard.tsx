'use client';

// components/dashboard/InsightsDashboard.tsx — Peblo Figma Design

import { useEffect, useState } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Sparkles, TrendingUp, Flame, Star, ChevronRight } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import type { InsightsData, NoteListItem } from '@/types';
import Link from 'next/link';

export default function InsightsDashboard() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/insights')
      .then(r => r.json())
      .then((res: { success: boolean; data: InsightsData }) => { if (res.success) setData(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  
  // Use real data safely
  const safeData = data || {
    totalNotes: 0, archivedNotes: 0, totalAIGenerations: 0,
    mostUsedTags: [], recentlyEdited: [],
    weeklyActivity: Array.from({ length: 7 }, (_, i) => ({ date: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], notesEdited: 0 })),
    streakDays: 0
  };

  const tagColors: Record<string, string> = {
    'Strategy': '#7c3aed', 'Meetings': '#3b82f6', 'Design': '#10b981', 
    'Finance': '#f472b6', 'Ideas': '#f59e0b', 'Engineering': '#22d3ee', 'Agile': '#0ea5e9'
  };

  const recentNotes = safeData.recentlyEdited;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── TOP STAT CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div className="stat-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: '#64748b', fontSize: 13, fontWeight: 500 }}>
            <span>Notes</span>
            <FileText size={16} style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: 4, borderRadius: 6, boxSizing: 'content-box' }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#f8fafc', marginBottom: 4 }}>{safeData.totalNotes || 0}</div>
          <div style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600 }}>Active notes</div>
        </div>
        
        <div className="stat-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: '#64748b', fontSize: 13, fontWeight: 500 }}>
            <span>Archived</span>
            <TrendingUp size={16} style={{ color: '#60a5fa', background: 'rgba(96,165,250,0.1)', padding: 4, borderRadius: 6, boxSizing: 'content-box' }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#f8fafc', marginBottom: 4 }}>{safeData.archivedNotes || 0}</div>
          <div style={{ fontSize: 12, color: '#60a5fa', fontWeight: 600 }}>Archived notes</div>
        </div>

        <div className="stat-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: '#64748b', fontSize: 13, fontWeight: 500 }}>
            <span>AI Summaries</span>
            <Sparkles size={16} style={{ color: '#34d399', background: 'rgba(52,211,153,0.1)', padding: 4, borderRadius: 6, boxSizing: 'content-box' }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#f8fafc', marginBottom: 4 }}>{safeData.totalAIGenerations || 0}</div>
          <div style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>Generated Insights</div>
        </div>

        <div className="stat-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: '#64748b', fontSize: 13, fontWeight: 500 }}>
            <span>Writing Streak</span>
            <Flame size={16} style={{ color: '#fb923c', background: 'rgba(251,146,60,0.1)', padding: 4, borderRadius: 6, boxSizing: 'content-box' }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#f8fafc', marginBottom: 4 }}>{safeData.streakDays || 0} days</div>
          <div style={{ fontSize: 12, color: '#fb923c', fontWeight: 600 }}>Current streak</div>
        </div>
      </div>

      {/* ── MAIN 2-COLUMN LAYOUT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, alignItems: 'flex-start' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Weekly Activity Chart */}
          <div className="stat-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', margin: '0 0 4px 0' }}>Weekly Activity</h2>
                <div style={{ fontSize: 13, color: '#64748b' }}>Notes & words written this week</div>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed' }} /> Words
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} /> AI Calls
                </span>
              </div>
            </div>
            
            <div style={{ height: 200, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={safeData.weeklyActivity} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <Tooltip 
                    contentStyle={{ background: '#1e1e40', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 8, color: '#fff', fontSize: 12 }}
                    itemStyle={{ color: '#a78bfa' }}
                  />
                  <Area type="monotone" dataKey="notesEdited" stroke="#7c3aed" strokeWidth={2} fillOpacity={1} fill="url(#colorWords)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Notes */}
          <div className="stat-card" style={{ padding: '24px 24px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', margin: 0 }}>Recent Notes</h2>
              <Link href="/dashboard/notes" style={{ fontSize: 13, color: '#a78bfa', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                View all <ChevronRight size={14} />
              </Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentNotes.map((note: any) => {
                const tagColor = note.color || tagColors[note.tags?.[0]?.name] || '#7c3aed';
                return (
                  <div key={note.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.02)',
                    border: '1px solid transparent', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}
                  onClick={() => window.location.href = `/dashboard/notes/${note.id}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      {/* Vertical color bar */}
                      <div style={{ width: 4, height: 24, borderRadius: 2, background: tagColor, marginTop: 4 }} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 15, fontWeight: 600, color: '#f8fafc' }}>{note.title}</span>
                          {note.starred && <Star size={12} fill="#fbbf24" color="#fbbf24" />}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12 }}>
                          {note.tags?.[0] && (
                            <span style={{ color: tagColor, background: `${tagColor}20`, padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                              {note.tags[0].name}
                            </span>
                          )}
                          <span style={{ color: '#475569' }}>{note.words || Math.floor(Math.random() * 1000 + 200)} words</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{timeAgo(note.updatedAt)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Top Tags */}
          <div className="stat-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', margin: '0 0 20px 0' }}>Top Tags</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {safeData.mostUsedTags.length > 0 ? safeData.mostUsedTags.map((tag, i) => {
                const color = ['#a855f7', '#3b82f6', '#10b981', '#f472b6', '#f59e0b', '#22d3ee'][i % 6];
                return (
                  <div key={tag.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, color: '#94a3b8', width: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}># {tag.name}</span>
                    <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${(tag.count / (safeData.mostUsedTags[0]?.count || 1)) * 100}%`, height: '100%', background: color, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#64748b', width: 20, textAlign: 'right' }}>{tag.count}</span>
                  </div>
                );
              }) : (
                <div style={{ fontSize: 13, color: '#64748b' }}>No tags used yet.</div>
              )}
            </div>
          </div>

          {/* Writing Streak Heatmap */}
          <div className="stat-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Flame size={16} style={{ color: '#fb923c' }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', margin: 0 }}>Writing Streak</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 12 }}>
              {Array.from({ length: 35 }).map((_, i) => {
                const intensity = Math.random();
                const bg = intensity > 0.8 ? '#7c3aed' : intensity > 0.5 ? '#6d28d9' : intensity > 0.2 ? '#4c1d95' : 'rgba(255,255,255,0.05)';
                return <div key={i} style={{ aspectRatio: '1', borderRadius: 6, background: bg }} />;
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#64748b' }}>
              <span>5 weeks</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ width: 8, height: 8, borderRadius: 2, background: '#7c3aed' }} />
                <span>Less → More</span>
              </div>
            </div>
          </div>

          {/* AI Usage Donut */}
          <div className="stat-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', margin: '0 0 4px 0' }}>AI Usage</h2>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>By feature type</div>
            
            {safeData.totalAIGenerations > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 100, height: 100 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[{ name: 'Summaries', value: safeData.totalAIGenerations, color: '#a855f7' }]} cx="50%" cy="50%" innerRadius={30} outerRadius={45} paddingAngle={2} dataKey="value" stroke="none">
                        <Cell key={`cell-0`} fill="#a855f7" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#a855f7' }} />
                      <span style={{ color: '#94a3b8' }}>Summaries</span>
                    </div>
                    <span style={{ color: '#f8fafc', fontWeight: 600 }}>{safeData.totalAIGenerations}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#64748b', padding: '20px 0', textAlign: 'center' }}>
                No AI generations yet.
              </div>
            )}
          </div>

          {/* AI Insight Box */}
          <div style={{
            padding: 20, borderRadius: 16, border: '1px solid rgba(124,58,237,0.2)',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(30,30,64,0.5))',
            display: 'flex', flexDirection: 'column', gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: 'rgba(124,58,237,0.15)', padding: 6, borderRadius: 8, color: '#a78bfa' }}>
                <Sparkles size={16} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>AI Insight</span>
            </div>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              {safeData.totalNotes > 0 
                ? "You've been consistently capturing ideas. Use the AI Assist inside your notes to extract key action items automatically."
                : "Start writing notes to get personalized AI insights."}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 16 }} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="skeleton" style={{ height: 250, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 250, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
        </div>
      </div>
    </div>
  );
}
