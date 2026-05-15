// app/layout.tsx — Root Layout with Providers

import type { Metadata } from 'next';
import { Inter, DM_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import Providers from '@/components/Providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
});

export const metadata: Metadata = {
  title: 'Peblo — AI-Powered Notes Workspace',
  description: 'The intelligent workspace that thinks alongside you — organizing, summarizing, and surfacing insights from your notes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${dmMono.variable}`}>
      <body style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
        <Providers>
          <div className="animated-3d-bg" aria-hidden="true">
            <div className="bg-orb orb-1" />
            <div className="bg-orb orb-2" />
            <div className="bg-orb orb-3" />
          </div>
          <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
            {children}
          </div>
        </Providers>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1e1e40',
              border: '1px solid rgba(124,58,237,0.25)',
              color: '#f8fafc',
              fontFamily: 'var(--font-inter), sans-serif',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            },
          }}
        />
      </body>
    </html>
  );
}
