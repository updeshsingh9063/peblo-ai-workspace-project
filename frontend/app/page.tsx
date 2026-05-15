// app/page.tsx — Landing Page (Peblo Figma Design)

import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DemoLoginButton from '@/components/DemoLoginButton';

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect('/dashboard');

  return (
    <main className="min-h-screen relative overflow-x-hidden" style={{ background: '#05050f', color: '#f8fafc' }}>

      {/* ── Animated background orbs ── */}
      <div className="animated-3d-bg" aria-hidden="true">
        <div className="bg-orb orb-1" />
        <div className="bg-orb orb-2" />
        <div className="bg-orb orb-3" />
        <canvas id="particles" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
      </div>

      {/* ── NAV ── */}
      <nav style={{
        position: 'relative', zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 48px', maxWidth: 1400, margin: '0 auto',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(124,58,237,0.5)',
            fontSize: 20,
          }}>✦</div>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>Peblo</span>
        </div>

        {/* Nav links */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 2,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 999, padding: '6px 8px',
          backdropFilter: 'blur(16px)',
        }}>
          {['Features', 'Pricing', 'Blog', 'Docs'].map(item => (
            <span key={item} className="nav-link" style={{
              padding: '6px 18px', borderRadius: 999, fontSize: 14, fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            >{item}</span>
          ))}
        </div>

        {/* Auth buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/login">
            <button className="btn-ghost" style={{
              border: '1px solid rgba(255,255,255,0.12)',
              padding: '9px 22px', borderRadius: 999,
            }}
            >Sign in</button>
          </Link>
          <Link href="/signup">
            <button className="btn-accent" style={{
              padding: '9px 22px', borderRadius: 999,
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
            >Get Started Free</button>
          </Link>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section style={{
        position: 'relative', zIndex: 10,
        textAlign: 'center', padding: '80px 24px 60px',
        maxWidth: 900, margin: '0 auto',
      }}>
        {/* Beta badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <span className="hero-badge">
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#a78bfa', display: 'inline-block',
              boxShadow: '0 0 8px #a78bfa',
            }} />
            AI-Native Workspace · Now in Beta
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(48px, 7vw, 88px)', fontWeight: 900,
          lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: 28,
        }}>
          Your notes,{' '}
          <span className="gradient-text">reimagined</span>
          <br />for the AI era
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(16px, 2vw, 20px)', color: '#64748b',
          lineHeight: 1.7, maxWidth: 640, margin: '0 auto 40px',
        }}>
          Peblo is the intelligent workspace that thinks alongside you — organizing,
          summarizing, and surfacing insights from your notes before you even ask.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 40 }}>
          <Link href="/signup">
            <button className="btn-accent" style={{
              padding: '16px 36px',
              borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer',
            }}
            >
              Start for free →
            </button>
          </Link>
          <DemoLoginButton />
        </div>

        {/* Social proof */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#fbbf24', fontSize: 18 }}>★★★★★</span>
          <span style={{ fontSize: 14, color: '#64748b' }}>Loved by 12,000+ creators and teams</span>
        </div>
      </section>

      {/* ── AI BRAIN VISUAL ── */}
      <section style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'center', padding: '20px 0 60px' }}>
        <div style={{ position: 'relative', width: 220, height: 220 }}>
          {/* Outer ring */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '1px solid rgba(124,58,237,0.2)',
            animation: 'spin 12s linear infinite',
          }} />
          {/* Middle ring */}
          <div style={{
            position: 'absolute', inset: 20, borderRadius: '50%',
            border: '1px solid rgba(59,130,246,0.2)',
            animation: 'spin 8s linear infinite reverse',
          }} />
          {/* Core */}
          <div style={{
            position: 'absolute', inset: 40,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2))',
            borderRadius: '50%', border: '1px solid rgba(124,58,237,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 60px rgba(124,58,237,0.3)',
            fontSize: 40,
          }}>🧠</div>
          {/* Floating labels */}
          {[
            { label: 'NLP', top: '18%', left: '-10%', color: '#a78bfa' },
            { label: 'ML', top: '8%', right: '-8%', color: '#22d3ee' },
            { label: 'GPT', bottom: '25%', left: '-12%', color: '#34d399' },
            { label: 'RAG', bottom: '18%', right: '-10%', color: '#f472b6' },
          ].map(({ label, color, ...pos }) => (
            <div key={label} style={{
              position: 'absolute', ...pos,
              background: 'rgba(20,20,40,0.8)', border: `1px solid ${color}40`,
              borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700,
              color, backdropFilter: 'blur(8px)', letterSpacing: '0.05em',
            }}>{label}</div>
          ))}
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}} />
      </section>

      {/* ── STATS SECTION ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 24px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 16 }}>
          {[
            { value: '2.4M+', label: 'Notes Created' },
            { value: '98%', label: 'Uptime SLA' },
            { value: '400ms', label: 'Avg AI Response' },
            { value: '140+', label: 'Countries' },
          ].map(({ value, label }) => (
            <div key={label} className="stats-box">
              <div style={{
                fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', marginBottom: 8,
              }}>{value}</div>
              <div style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{
            display: 'inline-block', padding: '4px 14px',
            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
            borderRadius: 999, fontSize: 12, fontWeight: 700, color: '#a78bfa',
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24,
          }}>FEATURES</span>
          <h2 style={{
            fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900,
            letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16,
          }}>
            Everything you need to{' '}
            <span className="gradient-text">think clearly</span>
          </h2>
          <p style={{ fontSize: 18, color: '#64748b', maxWidth: 500, margin: '0 auto' }}>
            Built for power users who demand the best tools without the clutter.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
          {[
            { icon: '🧠', title: 'AI Summarization', desc: 'Instantly condense long notes into crisp summaries with one click.', color: '#7c3aed' },
            { icon: '⚡', title: 'Smart Extraction', desc: 'Auto-detect action items, deadlines, and key decisions from your notes.', color: '#3b82f6' },
            { icon: '🔄', title: 'Real-time Collaboration', desc: 'Work together with live cursors, presence indicators, and instant sync.', color: '#22d3ee', featured: true },
            { icon: '🔒', title: 'End-to-End Encryption', desc: 'Your notes are encrypted at rest and in transit. Zero-knowledge architecture.', color: '#f472b6' },
            { icon: '🌐', title: 'Offline First', desc: 'Full functionality without internet. Sync automatically when back online.', color: '#f59e0b' },
            { icon: '⌘', title: 'Command Palette', desc: 'Navigate everything with keyboard shortcuts. ⌘K to rule them all.', color: '#34d399' },
          ].map(({ icon, title, desc, color, featured }) => (
            <div key={title} className="feature-card" style={featured ? {
              background: 'rgba(34,211,238,0.06)', borderColor: 'rgba(34,211,238,0.2)',
            } : {}}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `${color}18`, border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, marginBottom: 20,
              }}>{icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: featured ? '#22d3ee' : '#f8fafc' }}>{title}</h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WORKSPACE MOCKUP ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '40px 24px 100px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="workspace-mockup">
          {/* Title bar */}
          <div className="mockup-titlebar">
            <div className="mockup-dot" style={{ background: '#ff5f57' }} />
            <div className="mockup-dot" style={{ background: '#ffbd2e' }} />
            <div className="mockup-dot" style={{ background: '#28c840' }} />
            <div style={{
              flex: 1, textAlign: 'center', fontSize: 13, color: '#475569',
              background: 'rgba(255,255,255,0.04)', borderRadius: 8,
              padding: '4px 16px', maxWidth: 400, margin: '0 auto',
            }}>app.peblo.ai/workspace</div>
          </div>
          {/* Workspace content */}
          <div style={{ display: 'flex', height: 280 }}>
            {/* Sidebar */}
            <div style={{ width: 200, borderRight: '1px solid rgba(255,255,255,0.06)', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {['Q2 Strategy', 'Meeting Notes', 'Product Roadmap', 'Design Review', 'Sprint Planning'].map((note, i) => (
                <div key={note} style={{
                  padding: '8px 12px', borderRadius: 8, fontSize: 13,
                  background: i === 0 ? 'rgba(124,58,237,0.15)' : 'transparent',
                  color: i === 0 ? '#a78bfa' : '#64748b',
                  cursor: 'pointer', fontWeight: i === 0 ? 600 : 400,
                }}>{note}</div>
              ))}
            </div>
            {/* Editor */}
            <div style={{ flex: 1, padding: '20px 24px' }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Q2 Product Strategy</div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>
                This quarter we&apos;re focused on three key initiatives...
              </div>
              <div style={{ fontSize: 13, color: '#7c3aed', fontWeight: 600, marginTop: 8 }}>## 1. AI-First Features</div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>Integrate LLM capabilities into core note workflows</div>
            </div>
          </div>
          {/* AI Summary bar */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '12px 24px',
            background: 'rgba(124,58,237,0.06)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 14 }}>✦</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa' }}>AI Summary</span>
            <span style={{ fontSize: 13, color: '#64748b' }}>This note outlines Q2 strategy focusing on AI integration, user growth, and performance improvements...</span>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '40px 24px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(32px,5vw,48px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 16 }}>
            Loved by <span className="gradient-text-purple" style={{ color: '#22d3ee' }}>builders</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
          {[
            {
              quote: '"Peblo completely changed how our team captures meeting insights. The AI summaries save us hours every week."',
              name: 'Sarah Chen', role: 'Product Lead @ Vercel', initial: 'SC', bg: '#7c3aed'
            },
            {
              quote: '"The most beautiful note-taking experience I\'ve ever used. Feels like it\'s from the future."',
              name: 'Marcus Rivera', role: 'Founder @ Linear', initial: 'MR', bg: '#3b82f6'
            },
            {
              quote: '"Finally, a workspace that matches the quality of tools we build. The 3D interactions are chef\'s kiss."',
              name: 'Yuki Tanaka', role: 'Design Engineer @ Framer', initial: 'YT', bg: '#10b981'
            }
          ].map((t) => (
            <div key={t.name} style={{
              background: 'rgba(20, 20, 40, 0.5)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 24, padding: 32, backdropFilter: 'blur(16px)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 16, color: '#fbbf24', fontSize: 14 }}>
                  ★★★★★
                </div>
                <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.6, marginBottom: 24 }}>{t.quote}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: t.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: 'white'
                }}>{t.initial}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section style={{
        position: 'relative', zIndex: 10, textAlign: 'center',
        padding: '40px 24px 120px',
      }}>
        <div style={{
          maxWidth: 600, margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(59,130,246,0.08))',
          border: '1px solid rgba(124,58,237,0.2)', borderRadius: 28,
          padding: '60px 40px', backdropFilter: 'blur(20px)',
        }}>
          <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 16 }}>
            Start thinking <span className="gradient-text">smarter</span>
          </h2>
          <p style={{ fontSize: 16, color: '#64748b', marginBottom: 32 }}>
            Join thousands of teams already using Peblo to capture, organize, and act on their best ideas.
          </p>
          <Link href="/signup">
            <button style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: 'white', border: 'none', padding: '16px 40px',
              borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(124,58,237,0.5)',
            }}>
              Get started for free →
            </button>
          </Link>
          <p style={{ fontSize: 13, color: '#475569', marginTop: 16 }}>No credit card required · Free forever plan</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        position: 'relative', zIndex: 10,
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '32px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        maxWidth: 1400, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>✦</span>
          <span style={{ fontWeight: 700, color: '#94a3b8' }}>Peblo</span>
        </div>
        <span style={{ fontSize: 13, color: '#334155' }}>© 2026 Peblo. Built for curious minds.</span>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy', 'Terms', 'Status'].map(item => (
            <span key={item} style={{ fontSize: 13, color: '#475569', cursor: 'pointer' }}>{item}</span>
          ))}
        </div>
      </footer>
    </main>
  );
}
