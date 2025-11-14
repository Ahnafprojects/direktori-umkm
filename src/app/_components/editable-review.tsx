'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, Save, X, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Review {
  id: string;
  comment: string;
  rating: number;
  userId: string;
  user: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface EditableReviewProps {
  review: Review;
  currentUserId: string | null;
  onReviewUpdate: (updatedReview: Review) => void;
  onReviewDelete: (reviewId: string) => void;
}

export default function EditableReview({ 
  review, 
  currentUserId, 
  onReviewUpdate, 
  onReviewDelete 
}: EditableReviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(review.comment);
  const [editedRating, setEditedRating] = useState(review.rating);
  const [isLoading, setIsLoading] = useState(false);

  const isOwner = currentUserId === review.userId;

  const handleSave = async () => {
    if (!editedComment.trim()) {
      toast.error('Komentar tidak boleh kosong');
      return;
    }

    if (editedRating < 1 || editedRating > 5) {
      toast.error('Rating harus antara 1-5');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/reviews/${review.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: editedComment,
          rating: editedRating,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Review berhasil diperbarui');
        onReviewUpdate({
          ...review,
          comment: editedComment,
          rating: editedRating
        });
        setIsEditing(false);
      } else {
        toast.error(data.error || 'Gagal memperbarui review');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Terjadi kesalahan saat memperbarui review');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus review ini?')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/reviews/${review.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Review berhasil dihapus');
        onReviewDelete(review.id);
      } else {
        toast.error(data.error || 'Gagal menghapus review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Terjadi kesalahan saat menghapus review');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedComment(review.comment);
    setEditedRating(review.rating);
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-semibold">{review.user?.name || 'Anonymous'}</p>
            <span className="text-sm text-muted-foreground">
              {new Date(review.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Rating Display/Edit */}
          {isEditing ? (
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setEditedRating(star)}
                  className={`w-6 h-6 ${
                    star <= editedRating
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-400'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-lg ${
                    i < review.rating
                      ? 'text-yellow-500'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          )}

          {/* Comment Display/Edit */}
          {isEditing ? (
            <Textarea
              value={editedComment}
              onChange={(e) => setEditedComment(e.target.value)}
              className="mb-2"
              rows={3}
              placeholder="Tulis review Anda..."
            />
          ) : (
            <p className="text-muted-foreground mb-2">{review.comment}</p>
          )}
        </div>

        {/* Action Buttons */}
        {isOwner && (
          <div className="flex gap-2 ml-4">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isLoading}
                  className="text-xs"
                >
                  <Save className="w-3 h-3 mr-1" />
                  Simpan
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Batal
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  disabled={isLoading}
                  className="text-xs"
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Hapus
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}