// app/dashboard/notes/page.tsx — Notes List Page
// NoteListView uses useSearchParams, which requires a Suspense boundary.

import { Suspense } from 'react';
import NoteListView from '@/components/notes/NoteListView';

export const metadata = { title: 'Notes — Peblo Notes' };

export default function NotesPage() {
  return (
    <Suspense fallback={<NotesPageSkeleton />}>
      <NoteListView />
    </Suspense>
  );
}

function NotesPageSkeleton() {
  return (
    <div style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="skeleton" style={{ height: 48, width: 300, borderRadius: 8 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton" style={{ height: 150, borderRadius: 12 }} />
        ))}
      </div>
    </div>
  );
}
