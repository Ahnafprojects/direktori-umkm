import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { db } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const notifications: any[] = [];

    // 1. Notifikasi Review Dibalas Owner (7 hari terakhir)
    const reviewsWithReply = await db.review.findMany({
      where: {
        userId: userId,
        ownerReply: { not: null }, // Ada balasan dari owner
        ownerReplyAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 hari terakhir
        }
      },
      include: {
        Umkm: {
          select: { name: true, slug: true }
        },
        replier: {
          select: { name: true }
        }
      },
      orderBy: {
        ownerReplyAt: 'desc'
      },
      take: 10
    });

    // Transform review replies to notifications
    const replyNotifications = reviewsWithReply.map((review: any) => ({
      id: `reply-${review.id}`,
      type: 'review_reply' as const,
      title: 'Review Anda Dibalas',
      message: `${review.replier?.name || 'Owner'} membalas review Anda di ${review.Umkm.name}: "${review.ownerReply?.substring(0, 50)}${review.ownerReply && review.ownerReply.length > 50 ? '...' : ''}"`,
      createdAt: review.ownerReplyAt?.toISOString() || new Date().toISOString(),
      isRead: false,
      link: `/umkm/${review.Umkm.slug}#review-${review.id}`,
      umkmName: review.Umkm.name
    }));

    notifications.push(...replyNotifications);

    // 2. Notifikasi Status Pesanan Berubah (7 hari terakhir)
    const recentOrders = await db.order.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 hari terakhir
        }
      },
      include: {
        umkm: {
          select: { name: true, slug: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 15
    });

    // Transform orders to status notifications
    const orderNotifications = recentOrders.map((order: any) => {
      let title = '';
      let message = '';
      
      switch (order.status) {
        case 'PENDING':
          title = 'Pesanan Diterima';
          message = `Pesanan Anda di ${order.umkm.name} sedang menunggu konfirmasi`;
          break;
        case 'ACCEPTED':
          title = 'Pesanan Dikonfirmasi';
          message = `Pesanan Anda di ${order.umkm.name} telah diterima dan sedang diproses`;
          break;
        case 'PREPARING':
          title = 'Pesanan Diproses';
          message = `Pesanan Anda di ${order.umkm.name} sedang disiapkan`;
          break;
        case 'READY':
          title = 'Pesanan Siap';
          message = `Pesanan Anda di ${order.umkm.name} sudah siap untuk diambil/diantar`;
          break;
        case 'DELIVERED':
          title = 'Pesanan Selesai';
          message = `Pesanan Anda di ${order.umkm.name} telah selesai. Terima kasih!`;
          break;
        case 'CANCELLED':
          title = 'Pesanan Dibatalkan';
          message = `Pesanan Anda di ${order.umkm.name} telah dibatalkan`;
          break;
        default:
          title = 'Update Pesanan';
          message = `Ada update untuk pesanan Anda di ${order.umkm.name}`;
      }

      return {
        id: `order-${order.id}`,
        type: 'order_status' as const,
        title,
        message,
        createdAt: order.createdAt.toISOString(),
        isRead: false,
        link: `/status/${order.id}`,
        orderId: order.id,
        status: order.status,
        umkmName: order.umkm.name
      };
    });

    notifications.push(...orderNotifications);

    // 3. Sort by date and limit
    const sortedNotifications = notifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20); // Limit to 20 most recent

    return NextResponse.json({
      notifications: sortedNotifications,
      unreadCount: sortedNotifications.length
    });

  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}