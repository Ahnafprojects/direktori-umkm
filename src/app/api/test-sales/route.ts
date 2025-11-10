// API test tanpa auth untuk debugging
import { db } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const umkmId = 51; // ID UMKM yang kita tahu ada data
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    console.log('Test API: Querying sales data for UMKM:', umkmId, 'from date:', thirtyDaysAgo);
    
    const salesDataRaw = await db.$queryRaw<
      { date: string; total: number }[]
    >`
      SELECT 
        DATE("createdAt") as date,
        COALESCE(SUM("totalAmount"), 0)::integer as total
      FROM "Order"
      WHERE "umkmId" = ${umkmId}
        AND "status" = 'DELIVERED'
        AND "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC; 
    `;
    
    console.log('Test API: Raw sales data:', salesDataRaw);
    
    // Format data untuk Recharts
    const salesData = salesDataRaw.map((d: { date: string; total: number }) => ({
      name: new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      Pendapatan: d.total,
    }));

    console.log('Test API: Formatted sales data:', salesData);

    return NextResponse.json({
      salesData: salesData,
      message: 'Test data retrieved successfully'
    });

  } catch (error) {
    console.error('Test API Error:', error);
    return NextResponse.json(
      { error: 'Test API failed' },
      { status: 500 }
    );
  }
}