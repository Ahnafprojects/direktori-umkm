// src/app/api/owner-reply/[reviewId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { db } from '@/lib/prisma';

// Update owner reply
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { reviewId } = await params;
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ownerReply } = await request.json();

    // Validasi input
    if (!ownerReply) {
      return NextResponse.json({ error: 'Balasan owner diperlukan' }, { status: 400 });
    }

    // Cek apakah review ada dan user adalah owner UMKM tersebut
    const review = await db.review.findFirst({
      where: { id: parseInt(reviewId) },
      include: {
        Umkm: true
      }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review tidak ditemukan' }, { status: 404 });
    }

    if (review.Umkm.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Anda bukan pemilik UMKM ini' }, { status: 403 });
    }

    // Update owner reply
    const updatedReview = await db.review.update({
      where: { id: parseInt(reviewId) },
      data: {
        ownerReply: ownerReply.trim(),
        replierId: session.user.id,
        ownerReplyAt: new Date()
      }
    });

    return NextResponse.json({ 
      message: 'Balasan owner berhasil diperbarui',
      review: updatedReview
    });

  } catch (error) {
    console.error('Error updating owner reply:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// Delete owner reply
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { reviewId } = await params;
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cek apakah review ada dan user adalah owner UMKM tersebut
    const review = await db.review.findFirst({
      where: { id: parseInt(reviewId) },
      include: {
        Umkm: true
      }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review tidak ditemukan' }, { status: 404 });
    }

    if (review.Umkm.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Anda bukan pemilik UMKM ini' }, { status: 403 });
    }

    if (!review.ownerReply) {
      return NextResponse.json({ error: 'Tidak ada balasan owner untuk dihapus' }, { status: 400 });
    }

    // Hapus owner reply
    await db.review.update({
      where: { id: parseInt(reviewId) },
      data: {
        ownerReply: null,
        replierId: null,
        ownerReplyAt: null
      }
    });

    return NextResponse.json({ 
      message: 'Balasan owner berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting owner reply:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}