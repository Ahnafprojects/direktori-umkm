// src/app/api/orders/update-status/route.ts

import { db } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, newStatus } = await req.json();

    if (!orderId || !newStatus) {
      return NextResponse.json({ 
        error: 'Order ID and new status are required' 
      }, { status: 400 });
    }

    console.log(`User ${session.user.id} (role: ${session.user.role}) attempting to update order ${orderId} to ${newStatus}`);

    // Validasi status yang diizinkan (sesuai dengan Prisma schema)
    const allowedStatuses = ['PENDING', 'PAID', 'PREPARING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
    if (!allowedStatuses.includes(newStatus)) {
      return NextResponse.json({ 
        error: 'Invalid status' 
      }, { status: 400 });
    }

    // Verifikasi bahwa order ini milik UMKM user yang login
    const order = await db.order.findFirst({
      where: { 
        id: orderId,
        umkm: {
          ownerId: session.user.id
        }
      },
      include: {
        umkm: { select: { name: true, ownerId: true } }
      }
    });

    if (!order) {
      console.log(`Order ${orderId} not found for user ${session.user.id}`);
      return NextResponse.json({ 
        error: 'Order not found or access denied' 
      }, { status: 404 });
    }

    console.log(`Order found: ${order.id} for UMKM ${order.umkm.name} (owner: ${order.umkm.ownerId})`);

    // Update status order
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: {
        umkm: { select: { name: true } },
        user: { select: { name: true } }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Status pesanan berhasil diubah menjadi ${getStatusLabel(newStatus)}`,
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Gagal mengubah status pesanan' },
      { status: 500 }
    );
  }
}

// Helper function untuk label status
function getStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Menunggu';
    case 'PAID':
      return 'Sudah Bayar';
    case 'PREPARING':
      return 'Sedang Diproses';
    case 'SHIPPING':
      return 'Siap Diambil/Diantar';
    case 'DELIVERED':
      return 'Selesai';
    case 'CANCELLED':
      return 'Dibatalkan';
    default:
      return status;
  }
}