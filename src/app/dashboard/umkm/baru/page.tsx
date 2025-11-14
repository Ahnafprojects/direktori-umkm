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

  // Jika sudah PENGUSAHA, cek apakah sudah punya UMKM
  if (session.user.role === 'PENGUSAHA') {
    // Lanjut ke pengecekan existing UMKM di bawah
  }

  // Cek berapa UMKM yang sudah dimiliki user
  const existingUmkmCount = await db.umkm.count({
    where: {
      ownerId: session.user.id
    }
  });

  // Jika sudah 1 UMKM, redirect dengan pesan error
  if (existingUmkmCount >= 1) {
    return (
      <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button asChild variant="ghost" className="mb-4 -ml-2">
            <Link href="/dashboard/umkm/saya">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke UMKM Saya
            </Link>
          </Button>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-yellow-800 mb-2">
              Anda Sudah Memiliki UMKM
            </h2>
            <p className="text-yellow-700 mb-4">
              Satu akun hanya dapat memiliki satu UMKM.
            </p>
            <p className="text-sm text-yellow-600 mb-6">
              Anda dapat mengelola dan mengedit UMKM yang sudah ada.
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
          Daftarkan UMKM Anda
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-6">
          Isi detail di bawah ini untuk menampilkan bisnis Anda di direktori.
        </p>

        <UmkmForm categories={categories} />
      </div>
    </div>
  );
}
