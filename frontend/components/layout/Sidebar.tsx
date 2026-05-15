'use client';

// components/layout/Sidebar.tsx — Peblo Figma Design Sidebar

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { LayoutDashboard, FileText, CheckCircle2, Sparkles, Plus, LogOut, ChevronLeft, ChevronRight, Loader2, Hash } from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface SidebarProps {
  user: { name: string; email: string };
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/notes', label: 'All Notes', icon: FileText },
  { href: '/dashboard/notes?archived=true', label: 'Archived', icon: CheckCircle2 },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved === 'true') setCollapsed(true);
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return (
    <aside style={{ width: 260, height: '100vh', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-subtle)' }} />
  );

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  }

  async function handleNewNote() {
    setCreating(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Note', content: '', tags: [] }),
      });
      const data: { success: boolean; data?: { id: string } } = await res.json();
      if (data.success && data.data?.id) {
        router.push(`/dashboard/notes/${data.data.id}`);
        toast.success('New note created ✦');
      } else toast.error('Failed to create note');
    } catch { toast.error('Something went wrong'); }
    finally { setCreating(false); }
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href.split('?')[0]);
  };

  return (
    <aside style={{
      width: collapsed ? 64 : 260,
      minWidth: collapsed ? 64 : 260,
      height: '100vh',
      background: 'rgba(12,12,26,0.95)',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.25s ease, min-width 0.25s ease',
      overflow: 'hidden', position: 'relative', zIndex: 10,
      backdropFilter: 'blur(20px)',
    }}>

      {/* Logo + collapse */}
      <div style={{
        padding: collapsed ? '18px 16px' : '18px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.04)', minHeight: 64,
      }}>
        {!collapsed && (
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
            }}>✦</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', lineHeight: 1 }}>Peblo</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#7c3aed', letterSpacing: '0.05em', marginTop: 1 }}>AI WORKSPACE</div>
            </div>
          </Link>
        )}
        {collapsed && (
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>✦</div>
        )}
        <button onClick={toggleCollapsed} style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 8, padding: 6, cursor: 'pointer', color: '#475569',
          display: 'flex', alignItems: 'center', transition: 'all 0.2s',
          marginLeft: collapsed ? 'auto' : 0, flexShrink: 0,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f8fafc'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#475569'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* New Note button */}
      <div style={{ padding: collapsed ? '12px 10px' : '12px 14px' }}>
        <button onClick={handleNewNote} disabled={creating} style={{
          width: '100%', padding: collapsed ? '10px' : '10px 14px',
          background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
          border: 'none', borderRadius: 10, color: 'white',
          fontSize: 13, fontWeight: 700, cursor: creating ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 8, transition: 'all 0.2s', fontFamily: 'inherit',
          boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
          opacity: creating ? 0.7 : 1,
        }}
        onMouseEnter={e => { if (!creating) (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(124,58,237,0.5)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(124,58,237,0.35)'; }}
        >
          {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {!collapsed && 'New Note'}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: collapsed ? '4px 10px' : '4px 10px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 9, textDecoration: 'none',
              color: active ? '#a78bfa' : '#475569',
              background: active ? 'rgba(124,58,237,0.12)' : 'transparent',
              fontSize: 13, fontWeight: active ? 600 : 400,
              transition: 'all 0.15s', whiteSpace: 'nowrap', overflow: 'hidden',
              border: active ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
            }}
            onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; } }}
            onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#475569'; } }}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}

        {!collapsed && (
          <div style={{ margin: '12px 0 4px', display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px' }}>
            <Hash size={11} style={{ color: '#334155' }} />
            <span style={{ fontSize: 11, color: '#334155', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Tools
            </span>
          </div>
        )}

        <Link href="/dashboard" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px', borderRadius: 9, textDecoration: 'none',
          color: '#475569', fontSize: 13, fontWeight: 400,
          transition: 'all 0.15s', whiteSpace: 'nowrap', border: '1px solid transparent',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}
        >
          <Sparkles size={15} style={{ flexShrink: 0, color: '#7c3aed' }} />
          {!collapsed && <span>AI Insights</span>}
        </Link>
      </nav>

      {/* User footer */}
      <div style={{
        padding: collapsed ? '12px 10px' : '12px 14px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', gap: 10,
        justifyContent: collapsed ? 'center' : 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden', minWidth: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: 'white',
          }}>
            {getInitials(user.name || 'U')}
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>
              <div style={{ fontSize: 11, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
            </div>
          )}
        </div>
        {!collapsed && (
          <button onClick={() => signOut({ callbackUrl: '/login' })} title="Sign out" style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#334155',
            display: 'flex', alignItems: 'center', padding: 6, borderRadius: 6, transition: 'all 0.2s', flexShrink: 0,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#334155'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </aside>
  );
}
