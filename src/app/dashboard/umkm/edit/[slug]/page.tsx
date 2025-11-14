// File: src/app/dashboard/umkm/edit/[slug]/page.tsx

import { getCategories, getUmkmForEdit } from "@/lib/actions";
import UmkmRegistrationForm from "@/app/_components/umkm-registration-form";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/lib/prisma";

type EditUmkmPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EditUmkmPage({ params }: EditUmkmPageProps) {
  const { slug } = await params;

  // Cek session dan role user
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/login?redirect=/dashboard/umkm/saya');
  }

  // Cek role dari database untuk memastikan data terbaru
  const userFromDb = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (!userFromDb || (userFromDb.role !== 'PENGUSAHA' && session.user.role !== 'PENGUSAHA')) {
    redirect('/dashboard?needUpgrade=true');
  }

  // Ambil data UMKM dan data kategori secara bersamaan
  const [umkmData, categories] = await Promise.all([
    getUmkmForEdit(slug),
    getCategories(),
  ]);

  // Jika UMKM tidak ditemukan, tampilkan halaman 404
  if (!umkmData) {
    notFound();
  }

  // Cek apakah UMKM milik user yang sedang login
  if (umkmData.ownerId !== session.user.id) {
    notFound(); // Atau redirect('/dashboard/umkm/saya') untuk keamanan
  }

  // ================================================================
  // === PERBAIKAN: Ubah tipe `id` dari number ke string sebelum     ===
  // === dikirim ke komponen form untuk mencocokkan tipe prop       ===
  // ================================================================
  const formattedInitialData = {
    ...umkmData,
    id: String(umkmData.id), // Konversi di sini
  };

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

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Edit UMKM</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-6">
          Perbarui detail bisnis Anda di bawah ini.
        </p>
        {/* Kirim data UMKM yang sudah diformat ke formulir */}
        <UmkmRegistrationForm
          categories={categories}
          initialData={formattedInitialData}
        />
      </div>
    </div>
  );
}
