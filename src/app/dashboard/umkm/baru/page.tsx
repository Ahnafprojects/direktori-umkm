import { db } from "@/lib/prisma";
// PERUBAHAN 1: Impor komponen dengan nama baru 'UmkmForm' dari file baru
import UmkmForm from "@/app/_components/umkm-registration-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function DaftarUmkmPage() {
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
          Daftarkan UMKM Baru
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-6">
          Isi detail di bawah ini untuk menampilkan bisnis Anda di direktori.
        </p>

        <UmkmForm categories={categories} />
      </div>
    </div>
  );
}
