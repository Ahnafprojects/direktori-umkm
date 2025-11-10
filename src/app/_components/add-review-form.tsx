// src/app/_components/add-review-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  umkmId: number;
  userId: string; // ID user yang sedang login
};

export default function AddReviewForm({ umkmId, userId }: Props) {
  const router = useRouter();
  const [rating, setRating] = useState(0); // 0 = belum dipilih
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || comment.trim() === '') {
      toast.error('Rating dan komentar tidak boleh kosong.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/reviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          umkmId,
          userId,
          rating,
          comment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal mengirim ulasan.');
      }

      toast.success('Ulasan berhasil dikirim!');
      setRating(0); // Reset form
      setComment('');
      router.refresh(); // <-- PENTING: Refresh data di server component (halaman detail)

    } catch (error: any) {
      console.error('Submit review error:', error);
      toast.error(error.message || 'Gagal mengirim ulasan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Tulis Ulasanmu</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating Bintang */}
          <div>
            <Label>Rating Anda:</Label>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  type="button" // PENTING: agar tidak submit form
                  variant="ghost"
                  size="icon"
                  onClick={() => setRating(star)}
                  aria-label={`Beri rating ${star} bintang`}
                >
                  <Star
                    className={cn(
                      'h-6 w-6',
                      star <= rating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300 dark:text-gray-600'
                    )}
                  />
                </Button>
              ))}
            </div>
          </div>

          {/* Komentar */}
          <div>
            <Label htmlFor="comment">Komentar Anda:</Label>
            <Textarea
              id="comment"
              placeholder="Bagaimana pengalamanmu di sini?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="mt-2"
              required
            />
          </div>

          {/* Tombol Submit */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kirim Ulasan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// --- Tambahkan komponen Card, CardHeader, CardTitle, CardContent, Label jika belum ada ---
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
// ------------------------------------------------------------------------------------
