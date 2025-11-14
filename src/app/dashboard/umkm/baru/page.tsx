import { db } from "@/lib/prisma";
// PERUBAHAN 1: Impor komponen dengan nama baru 'UmkmForm' dari file baru
import UmkmForm from "@/app/_components/umkm-registration-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function DaftarUmkmPage() {
  // Cek session dan validasi
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  // Cek role dari database untuk data terbaru (case user baru upgrade)
  const userFromDb = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  // Cek role user (prioritas database)
  const userRole = userFromDb?.role || session.user.role;
  const isPengusaha = userRole === 'PENGUSAHA';
  
  // CATATAN: Halaman ini boleh diakses user PELANGGAN untuk upgrade ke PENGUSAHA
  // Logika upgrade akan ditangani di UmkmForm component

  // Cek berapa UMKM yang sudah dimiliki user (hanya untuk PENGUSAHA)
  let existingUmkmCount = 0;
  if (isPengusaha) {
    existingUmkmCount = await db.umkm.count({
      where: {
        ownerId: session.user.id,
        isActive: true
      }
    });

    // Jika sudah punya UMKM aktif, redirect ke dashboard UMKM
    if (existingUmkmCount >= 1) {
      redirect('/dashboard/umkm/saya');
    }
  }

  // Ambil semua kategori dari database untuk ditampilkan di form
  const categories = await db.category.findMany();

  return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Tombol Kembali */}
        <Button asChild variant="ghost" className="mb-4 -ml-2">
          <Link href={isPengusaha ? "/dashboard/umkm/saya" : "/dashboard"}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isPengusaha ? "Kembali ke Daftar UMKM" : "Kembali ke Dashboard"}
          </Link>
        </Button>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          {isPengusaha ? "Daftarkan UMKM Anda" : "Upgrade ke Pengusaha & Daftar UMKM"}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-6">
          {isPengusaha 
            ? "Isi detail di bawah ini untuk menampilkan bisnis Anda di direktori."
            : "Dengan mendaftarkan UMKM, akun Anda otomatis akan diupgrade menjadi Pengusaha UMKM dan mendapat akses penuh ke dashboard."
          }
        </p>

        <UmkmForm categories={categories} currentUserRole={userRole} />
      </div>
    </div>
  );
}
