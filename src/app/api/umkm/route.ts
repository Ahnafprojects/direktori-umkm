// File: src/app/api/umkm/route.ts

import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

function createSlug(name: string) {
    return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // @ts-ignore
    if (!session || session.user?.role !== 'PENGUSAHA') {
      return new NextResponse('Tidak diizinkan', { status: 403 });
    }

    const body = await request.json();
    // 1. Ambil data baru dari body: latitude, longitude, dan products
    const { name, description, address, phone, openingHours, categoryId, latitude, longitude, products } = body;
    
    if (!name || !description || !address || !categoryId) {
        return NextResponse.json({ message: 'Nama, deskripsi, alamat, dan kategori wajib diisi.' }, { status: 400 });
    }
    
    const slug = createSlug(name);

    // 2. Siapkan data produk untuk nested write Prisma
    const productData = products && products.length > 0 
      ? {
          ProductCategory: {
            create: {
              name: 'Menu Utama', // Kita buat satu kategori default
              Product: {
                create: products.map((p: any) => ({
                  name: p.name,
                  description: p.description,
                  price: parseFloat(p.price), // Pastikan harga adalah angka
                })),
              },
            },
          },
        }
      : {};

    const newUmkm = await db.umkm.create({
        data: {
            name,
            slug: `${slug}-${Date.now()}`,
            description,
            address,
            phone,
            openingHours,
            categoryId: parseInt(categoryId),
            // 3. Tambahkan latitude dan longitude (ubah dari string ke angka)
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            // @ts-ignore
            ownerId: session.user.id,
            photos: ['/images/placeholder-umkm.jpg'], 
            rating: 4.0,
            // 4. Masukkan data produk yang sudah disiapkan
            ...productData,
        }
    });

    revalidatePath('/');
    revalidatePath(`/umkm/${newUmkm.slug}`); // Revalidate halaman detail juga

    return NextResponse.json(newUmkm, { status: 201 });

  } catch (error) {
    console.error("UMKM_REGISTRATION_ERROR", error);
    // Berikan pesan error yang lebih spesifik jika memungkinkan
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}