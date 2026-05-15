'use client';
import { signIn } from 'next-auth/react';

export default function DemoLoginButton() {
  return (
    <button 
      onClick={() => signIn('credentials', { email: 'demo@peblo.ai', password: 'password123', callbackUrl: '/dashboard' })}
      className="btn-ghost" 
      style={{
        padding: '16px 36px', borderRadius: 14,
        fontSize: 16, fontWeight: 600, cursor: 'pointer',
      }}
    >
      ▷ Live demo
    </button>
  );
}
