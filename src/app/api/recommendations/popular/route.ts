import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET() {
  try {
    // Ambil UMKM yang benar-benar populer (minimal 1 favorit)
    const popularUmkms = await db.umkm.findMany({
      where: {
        favorites: {
          some: {} // Filter: hanya UMKM yang punya minimal 1 favorit
        }
      },
      include: {
        Category: true,
        ProductCategory: {
          include: {
            Product: { 
              where: { isFeatured: true },
              take: 5,
            }
          }
        },
        _count: {
          select: {
            favorites: true // Hitung jumlah favorit
          }
        }
      },
      orderBy: {
        favorites: {
          _count: 'desc' // Urutkan berdasarkan jumlah favorit terbanyak
        }
      },
      take: 6 // Ambil 6 UMKM terpopuler
    });

    // Jika tidak ada UMKM dengan favorit, ambil UMKM terbaru sebagai fallback
    if (popularUmkms.length === 0) {
      const fallbackUmkms = await db.umkm.findMany({
        include: {
          Category: true,
          ProductCategory: {
            include: {
              Product: { 
                where: { isFeatured: true },
                take: 5,
              }
            }
          },
          _count: {
            select: {
              favorites: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc' // Urutkan berdasarkan yang terbaru
        },
        take: 6
      });
      
      return NextResponse.json(fallbackUmkms);
    }

    return NextResponse.json(popularUmkms);
  } catch (error) {
    console.error('Error fetching popular UMKMs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular recommendations' },
      { status: 500 }
    );
  }
}
