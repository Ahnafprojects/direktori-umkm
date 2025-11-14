'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, Save, X, Trash2, MoreHorizontal } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
    <div className="space-y-3">
      {/* Header with name, date, and actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2">
            <p className="font-semibold text-sm sm:text-base truncate">{review.user?.name || 'Anonymous'}</p>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {new Date(review.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
        
        {/* Three-dot menu for current user */}
        {isOwner && !isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        {/* Edit mode buttons */}
        {isOwner && isEditing && (
          <div className="flex gap-1 sm:gap-2 shrink-0">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isLoading}
              className="text-xs px-2 py-1 h-7"
            >
              <Save className="w-3 h-3 sm:mr-1" />
              <span className="hidden sm:inline">Simpan</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="text-xs px-2 py-1 h-7"
            >
              <X className="w-3 h-3 sm:mr-1" />
              <span className="hidden sm:inline">Batal</span>
            </Button>
          </div>
        )}

      </div>
      
      {/* Content area */}
      <div>

        {/* Rating Display/Edit */}
        {isEditing ? (
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setEditedRating(star)}
                className={`w-7 h-7 text-xl transition-colors ${
                  star <= editedRating
                    ? 'text-yellow-500'
                    : 'text-gray-300 hover:text-yellow-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        ) : (
          <div className="flex gap-0.5 mb-3">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-base sm:text-lg ${
                  i < review.rating
                    ? 'text-yellow-500'
                    : 'text-gray-300 dark:text-gray-600'
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
            className="w-full resize-none"
            rows={3}
            placeholder="Tulis review Anda..."
          />
        ) : (
          <p className="text-sm sm:text-base text-foreground leading-relaxed break-words">{review.comment}</p>
        )}
      </div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Review</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus review ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}