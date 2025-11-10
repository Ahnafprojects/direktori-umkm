// File: src/app/api/umkm/route.ts

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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
      return NextResponse.json(
        { message: 'Tidak diizinkan. Hanya pengusaha yang dapat mendaftarkan UMKM.' }, 
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, address, phone, openingHours, categoryId, latitude, longitude, products } = body;
    
    if (!name || !description || !address || !categoryId) {
        return NextResponse.json({ message: 'Nama, deskripsi, alamat, dan kategori wajib diisi.' }, { status: 400 });
    }
    
    const slug = createSlug(name);

    // Gunakan transaction untuk memastikan konsistensi data
    const result = await db.$transaction(async (prisma: any) => {
      // 1. Buat UMKM
      const newUmkm = await prisma.umkm.create({
        data: {
          name,
          slug: `${slug}-${Date.now()}`, // Tambahkan timestamp agar slug selalu unik
          description,
          address,
          phone,
          openingHours,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          categoryId: parseInt(categoryId),
          // @ts-ignore
          ownerId: session.user.id, // Hubungkan UMKM dengan pemiliknya
          // Nilai default untuk field lainnya
          photos: ['/images/placeholder-umkm.jpg'], 
          rating: 4.0,
        }
      });

      // 2. Buat ProductCategory default untuk UMKM ini
      const productCategory = await prisma.productCategory.create({
        data: {
          name: 'Menu Utama', // Default category name
          umkmId: newUmkm.id
        }
      });

      // 3. Buat produk-produk jika ada
      if (products && Array.isArray(products) && products.length > 0) {
        const validProducts = products.filter(p => p.name && p.price);
        
        if (validProducts.length > 0) {
          await prisma.product.createMany({
            data: validProducts.map(product => ({
              name: product.name,
              description: product.description || null,
              price: parseInt(product.price),
              productCategoryId: productCategory.id,
              photo: '/images/placeholder-product.jpg', // Default foto produk
              isFeatured: false
            }))
          });
        }
      }

      return newUmkm;
    });
    
    revalidatePath('/');
    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error("UMKM_REGISTRATION_ERROR", error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server saat mendaftarkan UMKM' }, 
      { status: 500 }
    );
  }
}