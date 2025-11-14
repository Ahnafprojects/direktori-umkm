// src/app/api/reviews/[reviewId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { db } from '@/lib/prisma';

// Update review
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

    const { comment, rating } = await request.json();

    // Validasi input
    if (!comment || !rating) {
      return NextResponse.json({ error: 'Comment dan rating diperlukan' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating harus antara 1-5' }, { status: 400 });
    }

    // Cek apakah review ada dan user adalah pemiliknya
    const existingReview = await db.review.findFirst({
      where: {
        id: parseInt(reviewId),
        userId: session.user.id
      }
    });

    if (!existingReview) {
      return NextResponse.json({ error: 'Review tidak ditemukan atau bukan milik Anda' }, { status: 403 });
    }

    // Update review
    const updatedReview = await db.review.update({
      where: { id: parseInt(reviewId) },
      data: {
        comment: comment.trim(),
        rating: parseInt(rating),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      message: 'Review berhasil diperbarui',
      review: updatedReview
    });

  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// Delete review
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

    // Cek apakah review ada dan user adalah pemiliknya
    const existingReview = await db.review.findFirst({
      where: {
        id: parseInt(reviewId),
        userId: session.user.id
      }
    });

    if (!existingReview) {
      return NextResponse.json({ error: 'Review tidak ditemukan atau bukan milik Anda' }, { status: 403 });
    }

    // Hapus review
    await db.review.delete({
      where: { id: parseInt(reviewId) }
    });

    return NextResponse.json({ 
      message: 'Review berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}