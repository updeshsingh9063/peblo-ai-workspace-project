'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';

export default function CreateNoteButton({ 
  id,
  className, 
  style, 
  collapsed = false 
}: { 
  id?: string;
  className?: string; 
  style?: React.CSSProperties;
  collapsed?: boolean;
}) {
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Note', content: '', tags: [] }),
      });
      
      const data = await res.json();
      
      if (data.success && data.data?.id) {
        toast.success('New note created ✦');
        router.push(`/dashboard/notes/${data.data.id}`);
      } else {
        toast.error(data.error || 'Failed to create note');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Something went wrong');
    } finally {
      setCreating(false);
    }
  }

  return (
    <button 
      id={id}
      onClick={handleCreate} 
      disabled={creating}
      className={className}
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : (style?.justifyContent || 'flex-start'),
        gap: collapsed ? '0' : '8px',
        cursor: creating ? 'not-allowed' : 'pointer',
        opacity: creating ? 0.7 : 1,
      }}
    >
      {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
      {!collapsed && 'New Note'}
    </button>
  );
}
