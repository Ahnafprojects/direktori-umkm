// src/app/api/orders/incoming/route.ts
import { db } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/authOptions";

export async function GET(req: NextRequest) {
  try {
    // Get logged in user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized - Silakan login terlebih dahulu' }, { status: 401 });
    }
    
    // @ts-ignore
    const userId = session.user.id;
    // @ts-ignore
    const userRole = session.user.role;
    
    // Cek role dari database untuk memastikan data terbaru
    const userFromDb = await db.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    // Hanya untuk pengusaha
    if (!userFromDb || (userFromDb.role !== 'PENGUSAHA' && userRole !== 'PENGUSAHA')) {
      return NextResponse.json({ error: 'Access denied - Hanya untuk pengusaha UMKM' }, { status: 403 });
    }
    
    console.log('Fetching incoming orders for UMKM owner:', userId);

    // Ambil semua order yang masuk ke UMKM milik user ini
    // @ts-ignore
    const userUmkms = await db.umkm.findMany({
      where: { ownerId: userId },
      select: { id: true }
    });
    
    const umkmIds = userUmkms.map((u: any) => u.id);
    
    // @ts-ignore
    const orders = await db.order.findMany({
      where: {
        umkmId: { in: umkmIds }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
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
    console.error("Error fetching incoming orders:", error);
    
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    
    return NextResponse.json({ 
      error: 'Gagal mengambil pesanan masuk',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
