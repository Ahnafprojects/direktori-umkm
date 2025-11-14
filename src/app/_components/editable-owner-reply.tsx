'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, Save, X, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
  const [editedReply, setEditedReply] = useState(reply.ownerReply);
  const [isLoading, setIsLoading] = useState(false);

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
      console.error('Error updating owner reply:', error);
      toast.error('Terjadi kesalahan saat memperbarui balasan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus balasan ini?')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/owner-reply/${reviewId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Balasan berhasil dihapus');
        onReplyDelete();
      } else {
        toast.error(data.error || 'Gagal menghapus balasan');
      }
    } catch (error) {
      console.error('Error deleting owner reply:', error);
      toast.error('Terjadi kesalahan saat menghapus balasan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedReply(reply.ownerReply);
    setIsEditing(false);
  };

  return (
    <div className="mt-4 ml-4 p-4 bg-muted/50 border-l-4 border-primary rounded-r-lg">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold text-sm flex items-center gap-2">
              <span className="text-primary font-bold">OWNER</span>
              Balasan Pemilik UMKM
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {reply.ownerReplyAt && new Date(reply.ownerReplyAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              {/* Action Buttons */}
              {isOwner && (
                <div className="flex gap-1">
                  {isEditing ? (
                    <>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isLoading}
                        className="text-xs h-6"
                      >
                        <Save className="w-3 h-3 mr-1" />
                        Simpan
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="text-xs h-6"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Batal
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                        disabled={isLoading}
                        className="text-xs h-6 px-2"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="text-xs h-6 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Reply Content */}
          {isEditing ? (
            <Textarea
              value={editedReply}
              onChange={(e) => setEditedReply(e.target.value)}
              className="text-sm"
              rows={3}
              placeholder="Tulis balasan Anda..."
            />
          ) : (
            <p className="text-sm text-muted-foreground">{reply.ownerReply}</p>
          )}
        </div>
      </div>
    </div>
  );
}