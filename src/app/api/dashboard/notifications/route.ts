import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Session user ID:', session.user.id);

    // Get user's UMKM
    const userWithUmkm = await prisma.user.findUnique({
      where: { id: session.user.id }, // Remove parseInt karena id adalah string
      include: { 
        umkms: true 
      }
    });

    console.log('User with UMKM:', userWithUmkm);

    const firstUmkm = userWithUmkm?.umkms?.[0];

    if (!firstUmkm) {
      console.log('No UMKM found for user');
      return NextResponse.json({ 
        notifications: [] 
      });
    }

    console.log('First UMKM:', firstUmkm);

    // Get recent orders (pesanan masuk untuk UMKM ini)
    const recentOrders = await prisma.order.findMany({
      where: {
        umkmId: firstUmkm.id, // Order langsung ke UMKM ini
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        }
      },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Get recent reviews (review masuk)
    const recentReviews = await prisma.review.findMany({
      where: {
        umkmId: firstUmkm.id,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        }
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Transform to notifications format
    const notifications = [
      // Order notifications
      ...recentOrders.map(order => ({
        id: `order-${order.id}`,
        type: 'order' as const,
        title: 'Pesanan Baru',
        message: `${order.user.name} memesan ${order.items.length} item dengan total ${new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(order.totalAmount)}`,
        createdAt: order.createdAt.toISOString(),
        isRead: false,
        orderId: order.id
      })),
      
      // Review notifications  
      ...recentReviews.map(review => ({
        id: `review-${review.id}`,
        type: 'review' as const,
        title: 'Review Baru',
        message: `${review.user.name} memberikan rating ${review.rating}/5: "${review.comment?.substring(0, 50)}${review.comment && review.comment.length > 50 ? '...' : ''}"`,
        createdAt: review.createdAt.toISOString(),
        isRead: false,
        reviewId: review.id
      }))
    ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 15); // Limit to 15 most recent

    return NextResponse.json({
      notifications,
      unreadCount: notifications.length
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}