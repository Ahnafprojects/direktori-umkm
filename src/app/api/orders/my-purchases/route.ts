// src/app/api/orders/my-purchases/route.ts
import { db } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    // Get logged in user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized - Silakan login terlebih dahulu' }, { status: 401 });
    }
    
    // @ts-ignore
    const userId = session.user.id;
    
    console.log('Fetching purchases for user:', userId);

    // Ambil order yang dibuat oleh user ini (sebagai customer)
    // @ts-ignore
    const orders = await db.order.findMany({
      where: {
        userId: userId
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        umkm: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders, { status: 200 });

  } catch (error) {
    console.error("Error fetching purchases:", error);
    
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    
    return NextResponse.json({ 
      error: 'Gagal mengambil riwayat pembelian',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}