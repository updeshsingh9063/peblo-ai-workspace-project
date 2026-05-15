// app/not-found.tsx — 404 page

import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: 24,
      flexDirection: 'column',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 80, marginBottom: 16 }}>🚨</div>
      <h1 style={{
        fontSize: 48, fontWeight: 800, color: 'var(--text-primary)',
        letterSpacing: '-0.03em', marginBottom: 8,
      }}>
        <span className="gradient-text">404</span>
      </h1>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
        Resource not found
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 32, maxWidth: 400 }}>
        This incident record or diagnostic page doesn&apos;t exist — it may have been deleted or archived.
      </p>
      <Link href="/dashboard">
        <button className="btn-accent" style={{ padding: '12px 28px', fontSize: 15 }}>
          ← Back to dashboard
        </button>
      </Link>
    </main>
  );
}
