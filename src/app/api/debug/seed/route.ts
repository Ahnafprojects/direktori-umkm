// API endpoint untuk seed database production dengan data minimal
import { db } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('Seeding production database...');
    
    // Data UMKM minimal untuk testing
    const testUmkmData = {
      name: 'Warkop Malaka',
      slug: 'warkop-malaka-35246',
      description: 'Warung kopi tradisional dengan cita rasa khas Indonesia',
      address: 'Jl. Raya Malaka No. 123',
      phone: '08123456789',
      latitude: -7.9666,
      longitude: 112.6326,
      categoryId: 1, // Asumsi kategori Food & Beverage
      ownerId: 'temp-owner-id' // Ini perlu disesuaikan dengan user ID yang ada
    };
    
    // Cek apakah sudah ada
    const existing = await db.umkm.findFirst({
      where: { slug: 'warkop-malaka-35246' }
    });
    
    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Warkop Malaka already exists',
        umkm: existing
      });
    }
    
    // Buat UMKM baru
    const newUmkm = await db.umkm.create({
      data: testUmkmData
    });
    
    console.log('Successfully created UMKM:', newUmkm);
    
    return NextResponse.json({
      success: true,
      message: 'Successfully seeded Warkop Malaka',
      umkm: newUmkm
    });

  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Seeding failed'
    }, { status: 500 });
  }
}
