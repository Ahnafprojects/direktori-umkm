// File: src/app/dashboard/umkm/saya/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

// 1. IMPORT KOMPONEN UMKMCARD ANDA
import UmkmCard from '@/components/umkm-card'; // Sesuaikan path jika berbeda

export default async function ProdukSayaPage() {
  const session = await getServerSession(authOptions);

  // Lindungi halaman ini: hanya untuk pengusaha yang sudah login
  // @ts-ignore
  if (!session || session.user?.role !== 'PENGUSAHA') {
    redirect('/');
  }

  // Ambil semua UMKM yang dimiliki oleh pengguna ini dari database
  const myUmkms = await db.umkm.findMany({
    where: {
      // @ts-ignore
      ownerId: session.user?.id,
    },
    include: {
        Category: true, // Ambil juga data kategori (ini sudah sesuai dengan UmkmCard)
    },
    orderBy: {
        name: 'asc'
    }
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">UMKM Saya</h1>
        <Button asChild>
          <Link href="/dashboard/umkm/baru">
            <PlusCircle className="mr-2 h-4 w-4" />
            Daftarkan UMKM Baru
          </Link>
        </Button>
      </div>

      {myUmkms.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Anda belum mendaftarkan UMKM.</p>
          <p className="text-muted-foreground">Klik tombol di atas untuk memulai!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Loop dan tampilkan setiap UMKM */}
          {myUmkms.map((umkm) => (
            // 2. GUNAKAN KOMPONEN UMKMCARD DI SINI
            <UmkmCard key={umkm.id} umkm={umkm} />
          ))}
        </div>
      )}
    </div>
  );
}