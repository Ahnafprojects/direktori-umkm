import { db } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Hitung jumlah UMKM milik user
    const umkmCount = await db.umkm.count({
      where: { 
        ownerId: session.user.id 
      }
    });

    const canAddMore = umkmCount < 3;
    const remainingSlots = 3 - umkmCount;

    return NextResponse.json({
      totalUmkm: umkmCount,
      maxUmkm: 3,
      canAddMore: canAddMore,
      remainingSlots: remainingSlots
    });

  } catch (error) {
    console.error('Error checking UMKM limit:', error);
    return NextResponse.json(
      { error: 'Gagal mengecek limit UMKM' },
      { status: 500 }
    );
  }
}
