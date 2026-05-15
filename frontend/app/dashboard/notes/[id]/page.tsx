// app/dashboard/notes/[id]/page.tsx — Note Editor Page

import NoteEditorView from '@/components/notes/NoteEditorView';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function NoteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  
  const { id } = await params;
  
  if (id.length !== 24) redirect('/dashboard/notes');

  const note = await prisma.note.findUnique({
    where: { id, userId: session.user.id },
    include: { tags: true },
  });
  
  if (!note) redirect('/dashboard/notes');

  return <NoteEditorView note={note as any} />;
}
