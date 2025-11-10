// API endpoint untuk debug database production
import { db } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Checking production database...');
    
    const umkms = await db.umkm.findMany({
      select: {
        id: true,
        name: true,
        slug: true
      },
      orderBy: {
        id: 'asc'
      }
    });
    
    console.log('Production UMKM found:', umkms.length);
    
    return NextResponse.json({
      success: true,
      total: umkms.length,
      umkms: umkms,
      message: `Found ${umkms.length} UMKM in production database`
    });

  } catch (error) {
    console.error('Production database error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database connection failed',
      message: 'Failed to connect to production database'
    }, { status: 500 });
  }
}
