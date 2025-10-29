// src/app/api/reviews/create/route.ts
import { db } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
// --- IMPORT FUNGSI AUTENTIKASI DARI SISTEM LOGIN-MU ---
// import { getCurrentUser } from '@/lib/auth'; // Contoh

export async function POST(req: NextRequest) {
  try {
    // --- 1. DAPATKAN USER YANG LOGIN ---
    // Panggil fungsi dari sistem login-mu untuk mendapatkan user ID
    // const user = await getCurrentUser();
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized: Anda harus login.' }, { status: 401 });
    // }
    // const userId = user.id;

    // --- GANTI DENGAN USER ID DUMMY UNTUK TES ---
    // const userId = "user_cuid_dummy_123"; // Sesuaikan dengan format CUID
    // ------------------------------------------

    // 2. Ambil data dari body request (dari form)
    const { umkmId, userId, rating, comment } = await req.json();

    // 3. Validasi Input
    if (!umkmId || !userId || !rating || !comment) {
      return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating harus antara 1 dan 5.' }, { status: 400 });
    }
    if (typeof comment !== 'string' || comment.trim() === '') {
      return NextResponse.json({ error: 'Komentar tidak boleh kosong.' }, { status: 400 });
    }

    // 4. Buat Ulasan Baru di Database
    const newReview = await db.review.create({
      data: {
        rating: rating,
        comment: comment,
        umkmId: umkmId,
        userId: userId, // ID User yang login
      },
    });

    // 5. HITUNG ULANG RATING RATA-RATA UMKM
    // Ambil semua rating untuk UMKM ini
    const reviews = await db.review.findMany({
      where: { umkmId: umkmId },
      select: { rating: true },
    });

    // Hitung rata-rata
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    // Update rating di tabel UMKM (bulatkan ke 1 desimal)
    await db.umkm.update({
      where: { id: umkmId },
      data: { rating: parseFloat(averageRating.toFixed(1)) },
    });

    // 6. Kirim respon sukses
    return NextResponse.json(newReview, { status: 201 });

  } catch (error) {
    console.error("Error creating review:", error);
    // Tangani error jika user sudah pernah review (jika ada unique constraint)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
         return NextResponse.json({ error: 'Anda sudah pernah memberikan ulasan untuk UMKM ini.' }, { status: 409 }); // Conflict
    }
    return NextResponse.json({ error: 'Gagal menyimpan ulasan.' }, { status: 500 });
  }
}

// --- Tambahkan impor Prisma jika belum ---
import { Prisma } from '@prisma/client';
// --------------------------------------