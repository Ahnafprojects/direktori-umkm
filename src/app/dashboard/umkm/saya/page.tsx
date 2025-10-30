// File: src/app/dashboard/umkm/saya/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import MyUmkmList from '@/app/_components/my-umkm-list';

export default async function ProdukSayaPage() {
  const session = await getServerSession(authOptions);

  // @ts-ignore
  if (!session || session.user?.role !== 'PENGUSAHA') {
    redirect('/');
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
            select: { id: true } // Kita hanya butuh jumlahnya, jadi ambil id saja
        }
    },
    orderBy: {
        name: 'asc'
    }
  });

  // PERBAIKAN #2: "Sucikan" data sebelum dikirim ke Client Component
  const plainUmkms = myUmkms.map(umkm => ({
    ...umkm,
    // Ubah Decimal menjadi number
    rating: umkm.rating ? Number(umkm.rating) : null,
    ProductCategory: umkm.ProductCategory.map(pc => ({
        ...pc,
        Product: pc.Product.map(p => ({
            ...p,
            // Ubah Int/Decimal menjadi number (jaga-jaga)
            price: p.price ? Number(p.price) : null,
        }))
    }))
  }));

  // Kirim data yang sudah "polos" sebagai props
  return <MyUmkmList initialUmkms={plainUmkms} />;
}