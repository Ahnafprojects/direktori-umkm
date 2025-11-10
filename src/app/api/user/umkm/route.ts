import { db } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cari semua UMKM milik user (maksimal 3)
    const umkmList = await db.umkm.findMany({
      where: { 
        ownerId: session.user.id 
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      take: 3, // Limit maksimal 3 UMKM per user
      orderBy: {
        id: 'asc' // Yang pertama dibuat akan muncul duluan (berdasarkan ID auto-increment)
      }
    });

    if (umkmList.length === 0) {
      return NextResponse.json({ error: 'Belum ada UMKM terdaftar' }, { status: 404 });
    }

    return NextResponse.json({
      umkmList: umkmList,
      selectedUmkm: umkmList[0], // Default ke UMKM pertama
      canAddMore: umkmList.length < 3 // Bisa tambah UMKM lagi atau tidak
    });

  } catch (error) {
    console.error('Error fetching user UMKM:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data UMKM' },
      { status: 500 }
    );
  }
}