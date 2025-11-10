// src/app/api/orders/route.ts
import { db } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
    
    console.log('Fetching orders for user:', userId, 'Role:', userRole);

    let orders;

    if (userRole === 'PENGUSAHA') {
      // Untuk pengusaha: ambil semua order yang masuk ke UMKM mereka
      // @ts-ignore
      const userUmkms = await db.umkm.findMany({
        where: { ownerId: userId },
        select: { id: true }
      });
      
      const umkmIds = userUmkms.map((u: any) => u.id);
      
      // @ts-ignore
      orders = await db.order.findMany({
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
    } else {
      // Untuk customer: ambil order yang dibuat oleh user ini
      // @ts-ignore
      orders = await db.order.findMany({
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
    }

    return NextResponse.json(orders, { status: 200 });

  } catch (error) {
    console.error("Error fetching orders:", error);
    
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    
    return NextResponse.json({ 
      error: 'Gagal mengambil riwayat pesanan',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
