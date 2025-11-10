// src/app/api/reviews/reply/route.ts
import { db } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: NextRequest) {
  try {
    // 1. Cek autentikasi
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized: Anda harus login.' }, { status: 401 });
    }

    // 2. Ambil data dari request
    const { reviewId, replyMessage } = await req.json();

    // 3. Validasi input
    if (!reviewId || !replyMessage) {
      return NextResponse.json({ error: 'Review ID dan pesan balasan wajib diisi.' }, { status: 400 });
    }

    if (typeof replyMessage !== 'string' || replyMessage.trim() === '') {
      return NextResponse.json({ error: 'Pesan balasan tidak boleh kosong.' }, { status: 400 });
    }

    // 4. Ambil data review dengan UMKM-nya
    const review = await db.review.findUnique({
      where: { id: parseInt(reviewId) },
      include: {
        Umkm: {
          select: { ownerId: true, name: true }
        }
      }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review tidak ditemukan.' }, { status: 404 });
    }

    // 5. SECURITY: Pastikan yang reply adalah pemilik UMKM
    // @ts-ignore
    if (review.Umkm.ownerId !== session.user.id) {
      return NextResponse.json({ 
        error: 'Hanya pemilik UMKM yang dapat membalas review.' 
      }, { status: 403 });
    }

    // 6. Update review dengan balasan owner
    const updatedReview = await db.review.update({
      where: { id: parseInt(reviewId) },
      data: {
        ownerReply: replyMessage.trim(),
        ownerReplyAt: new Date(),
        // @ts-ignore
        ownerReplyBy: session.user.id
      }
    });

    // 7. Return success
    return NextResponse.json({ 
      message: 'Balasan berhasil dikirim!',
      review: updatedReview
    }, { status: 200 });

  } catch (error) {
    console.error("Error replying to review:", error);
    return NextResponse.json({ 
      error: 'Gagal mengirim balasan. Silakan coba lagi.' 
    }, { status: 500 });
  }
}
