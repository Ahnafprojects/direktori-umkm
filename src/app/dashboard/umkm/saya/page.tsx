// File: src/app/dashboard/umkm/saya/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import MyUmkmList from "@/app/_components/my-umkm-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ProdukSayaPage() {
  const session = await getServerSession(authOptions);

  // @ts-ignore
  if (!session || session.user?.role !== "PENGUSAHA") {
    redirect("/");
  }

  // Ambil data UMKM di Server Component
  const myUmkms = await db.umkm.findMany({
    where: {
      // @ts-ignore
      ownerId: session.user?.id,
    },
    include: {
      Category: true,
      ProductCategory: {
        include: {
          Product: true,
        },
      },
      // PERBAIKAN #1: Sertakan data Review untuk mendapatkan jumlah ulasan
      Review: {
        select: { id: true }, // Kita hanya butuh jumlahnya, jadi ambil id saja
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // PERBAIKAN #2: "Sucikan" data sebelum dikirim ke Client Component
  const plainUmkms = myUmkms.map((umkm) => ({
    ...umkm,
    // Ubah Decimal menjadi number
    rating: umkm.rating ? Number(umkm.rating) : null,
    ProductCategory: umkm.ProductCategory.map((pc) => ({
      ...pc,
      Product: pc.Product.map((p) => ({
        ...p,
        // Ubah Int/Decimal menjadi number (jaga-jaga)
        price: p.price ? Number(p.price) : null,
      })),
    })),
  }));

  // Kirim data yang sudah "polos" sebagai props
  return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header dengan tombol kembali */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">UMKM Saya</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Kelola bisnis UMKM Anda
            </p>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/dashboard">
              ← Kembali ke Dashboard
            </Link>
          </Button>
        </div>

        <MyUmkmList initialUmkms={plainUmkms} />
      </div>
    </div>
  );
}
