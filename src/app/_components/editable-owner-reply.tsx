'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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

interface OwnerReply {
  ownerReply: string;
  ownerReplyAt?: string | null;
}

interface EditableOwnerReplyProps {
  reviewId: string;
  reply: OwnerReply;
  currentUserId: string | null;
  umkmOwnerId: string | null;
  onReplyUpdate: (updatedReply: OwnerReply) => void;
  onReplyDelete: () => void;
}

export default function EditableOwnerReply({ 
  reviewId,
  reply, 
  currentUserId, 
  umkmOwnerId,
  onReplyUpdate, 
  onReplyDelete 
}: EditableOwnerReplyProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedReply, setEditedReply] = useState(reply.ownerReply);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isOwner = currentUserId === umkmOwnerId;

  const handleSave = async () => {
    if (!editedReply.trim()) {
      toast.error('Balasan tidak boleh kosong');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/owner-reply/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerReply: editedReply,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Balasan berhasil diperbarui');
        onReplyUpdate({
          ownerReply: editedReply,
          ownerReplyAt: new Date().toISOString()
        });
        setIsEditing(false);
      } else {
        toast.error(data.error || 'Gagal memperbarui balasan');
      }
    } catch (error) {
      console.error('Error updating reply:', error);
      toast.error('Terjadi kesalahan saat memperbarui balasan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/owner-reply/${reviewId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Balasan berhasil dihapus');
        onReplyDelete();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Gagal menghapus balasan');
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error('Terjadi kesalahan saat menghapus balasan');
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCancel = () => {
    setEditedReply(reply.ownerReply);
    setIsEditing(false);
  };

  return (
    <div className="mt-3 p-3 bg-blue-50 border-l-4 border-primary rounded-r-lg">
      {/* Header with name, date, and three-dot menu */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-primary font-bold text-sm">Owner UMKM</span>
          <span className="text-xs text-muted-foreground">
            {reply.ownerReplyAt ? 
              new Date(reply.ownerReplyAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
              : 'Baru saja'
            }
          </span>
        </div>
        
        {/* Three-dot menu for owner */}
        {isOwner && !isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
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
          <div className="flex gap-1 shrink-0">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isLoading}
              className="text-xs h-7"
            >
              <Save className="w-3 h-3 mr-1" />
              Simpan
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="text-xs h-7"
            >
              <X className="w-3 h-3 mr-1" />
              Batal
            </Button>
          </div>
        )}
      </div>

      {/* Reply Content */}
      {isEditing ? (
        <Textarea
          value={editedReply}
          onChange={(e) => setEditedReply(e.target.value)}
          className="text-sm resize-none"
          rows={3}
          disabled={isLoading}
        />
      ) : (
        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
          {reply.ownerReply}
        </p>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Balasan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus balasan ini? Tindakan ini tidak dapat dibatalkan.
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