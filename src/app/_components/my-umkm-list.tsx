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
import { deactivateUmkm, activateUmkm } from "@/lib/actions";
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
  isActive?: boolean | null;
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
  const [isManageMode, setIsManageMode] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [umkmToManage, setUmkmToManage] = useState<Umkm | null>(null);

  // PENYEDERHANAAN: Gunakan satu fungsi untuk beralih mode
  const toggleMode = (mode: "edit" | "manage") => {
    if (mode === "edit") {
      setIsEditMode(!isEditMode);
      setIsManageMode(false); // Otomatis nonaktifkan mode lain
    } else if (mode === "manage") {
      setIsManageMode(!isManageMode);
      setIsEditMode(false); // Otomatis nonaktifkan mode lain
    }
  };

  const handleCardClick = (umkm: Umkm) => {
    if (isManageMode) {
      setUmkmToManage(umkm);
    } else if (isEditMode) {
      // Arahkan ke halaman edit dengan slug, bukan id
      router.push(`/dashboard/umkm/edit/${umkm.slug}`);
    }
  };

  const handleToggleActive = async (activate: boolean) => {
    if (!umkmToManage) return;
    startTransition(async () => {
      const result = activate 
        ? await activateUmkm(umkmToManage.id)
        : await deactivateUmkm(umkmToManage.id);
      
      if (result.success) {
        toast.success(result.message);
        // Update status isActive di state lokal
        setMyUmkms((prevUmkms) =>
          prevUmkms.map((u) => 
            u.id === umkmToManage.id 
              ? { ...u, isActive: activate }
              : u
          )
        );
      } else {
        toast.error(result.message || "Gagal mengubah status UMKM.");
      }
      setUmkmToManage(null);
      setIsManageMode(false);
    });
  };

  return (
    <>
      {/* Kontrol Mode Edit/Manage */}
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant={isManageMode ? "destructive" : "outline"}
          size="sm"
          onClick={() => toggleMode("manage")}
          aria-label={isManageMode ? "Batal Kelola" : "Masuk Mode Kelola"}
        >
          {isManageMode ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Batal
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Kelola UMKM
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
      {isManageMode && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-center text-sm text-destructive font-medium">
          Mode Kelola Aktif: Klik pada UMKM yang ingin Anda kelola (aktifkan/nonaktifkan).
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
            const isInteractionMode = isManageMode || isEditMode;
            const isInactive = umkm.isActive === false;
            return (
              <div
                key={umkm.id}
                onClick={
                  isInteractionMode ? () => handleCardClick(umkm) : undefined
                }
                className={`rounded-lg transition-all duration-200 ${
                  isInactive ? "opacity-50 border-2 border-dashed border-gray-400" : ""
                } ${
                  isManageMode
                    ? "cursor-pointer ring-2 ring-orange-500 hover:ring-offset-2 hover:ring-offset-background"
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
                <div className={`relative ${isInteractionMode ? "pointer-events-none" : ""}`}>
                  {isInactive && (
                    <div className="absolute top-2 right-2 z-10 bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Nonaktif
                    </div>
                  )}
                  <UmkmCard umkm={umkm as any} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog Kelola */}
      <AlertDialog
        open={!!umkmToManage}
        onOpenChange={() => setUmkmToManage(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kelola UMKM</AlertDialogTitle>
            <AlertDialogDescription>
              UMKM: <span className="font-bold">
                &ldquo;{umkmToManage?.name}&rdquo;
              </span>
              <br />Status saat ini: {umkmToManage?.isActive !== false ? "Aktif" : "Nonaktif"}
              <br />Pilih tindakan yang ingin dilakukan:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            {umkmToManage?.isActive !== false ? (
              <AlertDialogAction
                onClick={() => handleToggleActive(false)}
                disabled={isPending}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isPending ? "Menonaktifkan..." : "Nonaktifkan"}
              </AlertDialogAction>
            ) : (
              <AlertDialogAction
                onClick={() => handleToggleActive(true)}
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {isPending ? "Mengaktifkan..." : "Aktifkan"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
