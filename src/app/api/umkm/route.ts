// File: src/app/api/umkm/route.ts

import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Fungsi untuk membuat slug yang unik
function createSlug(name: string) {
    return name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // @ts-ignore
    if (!session || session.user?.role !== 'PENGUSAHA') {
      return new NextResponse('Tidak diizinkan', { status: 403 });
    }

    const body = await request.json();
    const { name, description, address, phone, openingHours, categoryId } = body;
    
    // Validasi dasar
    if (!name || !description || !address || !categoryId) {
        return NextResponse.json({ message: 'Nama, deskripsi, alamat, dan kategori wajib diisi.' }, { status: 400 });
    }
    
    const slug = createSlug(name);

    const newUmkm = await db.umkm.create({
        data: {
            name,
            slug: `${slug}-${Date.now()}`, // Tambahkan timestamp agar slug selalu unik
            description,
            address,
            phone,
            openingHours,
            categoryId: parseInt(categoryId),
            // @ts-ignore
            ownerId: session.user.id, // Hubungkan UMKM dengan pemiliknya
            // Nilai default untuk field lainnya
            photos: ['/images/placeholder-umkm.jpg'], 
            rating: 4.0,
        }
    });
    revalidatePath('/');
    return NextResponse.json(newUmkm, { status: 201 });

  } catch (error) {
    console.error("UMKM_REGISTRATION_ERROR", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}