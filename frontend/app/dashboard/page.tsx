// app/dashboard/page.tsx — Insights Dashboard (Server Component)

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import InsightsDashboard from '@/components/dashboard/InsightsDashboard';
import CreateNoteButton from '@/components/notes/CreateNoteButton';

export const metadata = {
  title: 'Dashboard — Resolve AI',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const firstName = session.user.name?.split(' ')[0] ?? 'there';

  const dateString = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h1 style={{
              fontSize: 28, fontWeight: 800, color: 'var(--text-primary)',
              letterSpacing: '-0.02em', marginBottom: 6,
            }}>
              Good {getGreeting()}, {firstName} ✨
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
              {dateString} · Here is your activity overview.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{
              width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </button>
            <CreateNoteButton className="btn-accent" style={{ padding: '8px 16px', borderRadius: 999 }} />
          </div>
        </div>
        <InsightsDashboard />
      </div>
    </div>
  );
}
