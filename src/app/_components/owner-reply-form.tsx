// src/app/_components/owner-reply-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Reply } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  reviewId: number;
  onReplySuccess?: () => void;
};

export default function OwnerReplyForm({ reviewId, onReplySuccess }: Props) {
  const router = useRouter();
  const [replyMessage, setReplyMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (replyMessage.trim() === '') {
      toast.error('Pesan balasan tidak boleh kosong.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/reviews/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          replyMessage: replyMessage.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal mengirim balasan.');
      }

      toast.success('Balasan berhasil dikirim!');
      setReplyMessage('');
      setShowForm(false);
      
      // Callback untuk refresh atau update state
      if (onReplySuccess) {
        onReplySuccess();
      } else {
        router.refresh(); // Refresh halaman untuk update data
      }

    } catch (error: any) {
      console.error('Reply error:', error);
      toast.error(error.message || 'Gagal mengirim balasan.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!showForm) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowForm(true)}
        className="mt-2"
      >
        <Reply className="h-4 w-4 mr-2" />
        Balas Review
      </Button>
    );
  }

  return (
    <Card className="mt-3 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Reply className="h-4 w-4" />
          Balas sebagai Pemilik UMKM
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Tulis balasan Anda untuk review ini..."
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            rows={3}
            className="resize-none"
            required
          />
          
          <div className="flex gap-2 justify-end">
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={() => {
                setShowForm(false);
                setReplyMessage('');
              }}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              size="sm"
              disabled={isLoading || replyMessage.trim() === ''}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kirim Balasan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}