'use client';

// app/signup/page.tsx — Signup Page (Peblo Design)

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) return;
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data: { success: boolean; error?: string } = await res.json();
      if (!data.success) { toast.error(data.error ?? 'Signup failed'); setLoading(false); return; }
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) { toast.error('Account created! Please sign in.'); router.push('/login'); }
      else { toast.success('Welcome to Peblo! ✦'); router.push('/dashboard'); router.refresh(); }
    } catch { toast.error('Something went wrong. Please try again.'); setLoading(false); }
  }

  const pwStrength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : password.match(/[A-Z]/) && password.match(/[0-9]/) ? 4 : 3;
  const strengthColors = ['', '#ef4444', '#f59e0b', '#22d3ee', '#34d399'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#05050f', padding: 24, position: 'relative',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', top: '15%', left: '30%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '25%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="fade-in" style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'rgba(14,14,28,0.85)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24,
          padding: '48px 40px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(124,58,237,0.08)',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 28 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 13,
                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, boxShadow: '0 4px 20px rgba(124,58,237,0.5)',
              }}>✦</div>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>Peblo</span>
            </Link>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', marginBottom: 8 }}>
              Create your workspace
            </h1>
            <p style={{ color: '#475569', fontSize: 14 }}>Start organizing smarter with AI</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { id: 'name', label: 'Full name', type: 'text', value: name, set: setName, placeholder: 'Your name', autoComplete: 'name' },
              { id: 'email', label: 'Email address', type: 'email', value: email, set: setEmail, placeholder: 'you@example.com', autoComplete: 'email' },
            ].map(({ id, label, type, value, set, placeholder, autoComplete }) => (
              <div key={id}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>{label}</label>
                <input
                  id={id} type={type} value={value} onChange={e => set(e.target.value)}
                  placeholder={placeholder} required autoComplete={autoComplete}
                  style={{
                    width: '100%', padding: '12px 16px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10, color: '#f8fafc', fontSize: 14, outline: 'none',
                    fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
            ))}

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
                Password <span style={{ color: '#334155', fontWeight: 400 }}>(min. 8 characters)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password" type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                  style={{
                    width: '100%', padding: '12px 44px 12px 16px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10, color: '#f8fafc', fontSize: 14, outline: 'none',
                    fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: 14, padding: 0,
                }}>{showPw ? '🙈' : '👁️'}</button>
              </div>
              {password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1,2,3,4].map(l => (
                      <div key={l} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: pwStrength >= l ? strengthColors[pwStrength] : 'rgba(255,255,255,0.08)',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  {pwStrength > 0 && <span style={{ fontSize: 11, color: strengthColors[pwStrength], fontWeight: 600 }}>{strengthLabels[pwStrength]}</span>}
                </div>
              )}
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '14px 20px', marginTop: 8,
                background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                color: 'white', border: 'none', borderRadius: 12,
                fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 24px rgba(124,58,237,0.4)', transition: 'all 0.2s', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? (
                <><span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Creating account...</>
              ) : 'Get started →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: '#475569' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}} />
    </main>
  );
}
