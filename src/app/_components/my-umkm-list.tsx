// File: src/app/_components/my-umkm-list.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
// Ganti FilePenLine dengan Pencil agar lebih konsisten
import { Trash2, X, Pencil } from "lucide-react";
import UmkmCard from "@/components/umkm-card";
import { toast } from "react-hot-toast";
import { deleteUmkm } from "@/lib/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Umkm = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  phone: string | null;
  openingHours: string | null;
  photos: string[];
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  hasPromo: boolean | null;
  isRecommended: boolean | null;
  categoryId: number;
  Category: { id: number; name: string; slug: string };
  ProductCategory: Array<{
    id: number;
    name: string;
    Product: Array<{
      id: number;
      name: string;
      price: number | null;
      photo: string | null;
      isFeatured: boolean | null;
    }>;
  }>;
  Review: Array<{ id: number }>;
};

export default function MyUmkmList({ initialUmkms }: { initialUmkms: Umkm[] }) {
  const router = useRouter();
  const [myUmkms, setMyUmkms] = useState(initialUmkms);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [umkmToDelete, setUmkmToDelete] = useState<Umkm | null>(null);

  // PENYEDERHANAAN: Gunakan satu fungsi untuk beralih mode
  const toggleMode = (mode: "edit" | "delete") => {
    if (mode === "edit") {
      setIsEditMode(!isEditMode);
      setIsDeleteMode(false); // Otomatis nonaktifkan mode lain
    } else if (mode === "delete") {
      setIsDeleteMode(!isDeleteMode);
      setIsEditMode(false); // Otomatis nonaktifkan mode lain
    }
  };

  const handleCardClick = (umkm: Umkm) => {
    if (isDeleteMode) {
      setUmkmToDelete(umkm);
    } else if (isEditMode) {
      // Arahkan ke halaman edit dengan slug, bukan id
      router.push(`/dashboard/umkm/edit/${umkm.slug}`);
    }
  };

  const handleDelete = () => {
    if (!umkmToDelete) return;
    startTransition(async () => {
      const result = await deleteUmkm(umkmToDelete.id);
      if (result.success) {
        toast.success(result.message);
        setMyUmkms((prevUmkms) =>
          prevUmkms.filter((u) => u.id !== umkmToDelete.id)
        );
      } else {
        toast.error(result.message || "Gagal menghapus UMKM.");
      }
      setUmkmToDelete(null);
      setIsDeleteMode(false);
    });
  };

  return (
    <>
      {/* Kontrol Mode Edit/Delete */}
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant={isDeleteMode ? "destructive" : "outline"}
          size="sm"
          onClick={() => toggleMode("delete")}
          aria-label={isDeleteMode ? "Batal Hapus" : "Masuk Mode Hapus"}
        >
          {isDeleteMode ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Batal
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus UMKM
            </>
          )}
        </Button>

        <Button
          variant={isEditMode ? "default" : "outline"}
          size="sm"
          onClick={() => toggleMode("edit")}
          aria-label={isEditMode ? "Batal Edit" : "Masuk Mode Edit"}
        >
          {isEditMode ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Batal
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit UMKM
            </>
          )}
        </Button>
      </div>

      {/* Notifikasi Mode */}
      {isEditMode && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-center text-sm text-primary font-medium">
          Mode Edit Aktif: Klik pada UMKM yang ingin Anda ubah.
        </div>
      )}
      {isDeleteMode && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-center text-sm text-destructive font-medium">
          Mode Hapus Aktif: Klik pada UMKM yang ingin Anda hapus.
        </div>
      )}

      {/* Grid UMKM */}
      {myUmkms.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Anda belum mendaftarkan UMKM.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myUmkms.map((umkm) => {
            const isInteractionMode = isDeleteMode || isEditMode;
            return (
              <div
                key={umkm.id}
                onClick={
                  isInteractionMode ? () => handleCardClick(umkm) : undefined
                }
                className={`rounded-lg transition-all duration-200 ${
                  isDeleteMode
                    ? "cursor-pointer ring-2 ring-destructive hover:ring-offset-2 hover:ring-offset-background"
                    : ""
                } ${
                  isEditMode
                    ? "cursor-pointer ring-2 ring-primary hover:ring-offset-2 hover:ring-offset-background"
                    : ""
                }`}
                role={isInteractionMode ? "button" : "article"}
                tabIndex={isInteractionMode ? 0 : -1}
                onKeyDown={
                  isInteractionMode
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ")
                          handleCardClick(umkm);
                      }
                    : undefined
                }
              >
                <div className={isInteractionMode ? "pointer-events-none" : ""}>
                  <UmkmCard umkm={umkm as any} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog Hapus */}
      <AlertDialog
        open={!!umkmToDelete}
        onOpenChange={() => setUmkmToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda Yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus UMKM
              <span className="font-bold">
                {" "}
                &ldquo;{umkmToDelete?.name}&rdquo;{" "}
              </span>
              secara permanen dari server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isPending ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
