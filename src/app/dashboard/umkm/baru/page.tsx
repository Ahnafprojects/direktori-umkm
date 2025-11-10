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
  
  if (!session?.user || session.user.role !== 'PENGUSAHA') {
    redirect('/dashboard');
  }

  // Cek berapa UMKM yang sudah dimiliki user
  const existingUmkmCount = await db.umkm.count({
    where: {
      ownerId: session.user.id
    }
  });

  // Jika sudah 3 UMKM, redirect dengan pesan error
  if (existingUmkmCount >= 3) {
    return (
      <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button asChild variant="ghost" className="mb-4 -ml-2">
            <Link href="/dashboard/umkm/saya">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar UMKM
            </Link>
          </Button>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-yellow-800 mb-2">
              Batas Maksimal UMKM Tercapai
            </h2>
            <p className="text-yellow-700 mb-4">
              Anda sudah memiliki 3 UMKM yang merupakan batas maksimal per akun pengusaha.
            </p>
            <p className="text-sm text-yellow-600 mb-6">
              Untuk menambah UMKM baru, Anda perlu menghapus salah satu UMKM yang sudah ada terlebih dahulu.
            </p>
            <Button asChild>
              <Link href="/dashboard/umkm/saya">
                Kelola UMKM Saya
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Ambil semua kategori dari database untuk ditampilkan di form
  const categories = await db.category.findMany();

  return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Tombol Kembali */}
        <Button asChild variant="ghost" className="mb-4 -ml-2">
          <Link href="/dashboard/umkm/saya">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar UMKM
          </Link>
        </Button>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Daftarkan UMKM Baru ({existingUmkmCount}/3)
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-2">
          Isi detail di bawah ini untuk menampilkan bisnis Anda di direktori.
        </p>
        
        {/* Info limit UMKM */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-700 font-medium">
              Anda dapat mendaftarkan maksimal 3 UMKM per akun
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Sisa slot: {3 - existingUmkmCount} UMKM
          </p>
        </div>

        <UmkmForm categories={categories} />
      </div>
    </div>
  );
}
