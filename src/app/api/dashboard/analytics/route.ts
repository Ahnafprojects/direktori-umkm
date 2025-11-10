// src/app/api/dashboard/analytics/route.ts

import { db } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/authOptions";

// Helper untuk mendapatkan tanggal 30 hari yang lalu
function getThirtyDaysAgo() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date;
}

export async function GET(req: NextRequest) {
  try {
    // --- 1. AUTENTIKASI UMKM ---
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Hanya UMKM owner yang bisa akses analytics
    if (session.user.role !== 'UMKM_OWNER') {
      return NextResponse.json({ error: 'Forbidden - Only UMKM owners allowed' }, { status: 403 });
    }

    // Cari UMKM berdasarkan user yang login
    const umkm = await db.umkm.findFirst({
      where: { ownerId: session.user.id }
    });

    if (!umkm) {
      return NextResponse.json({ error: 'UMKM not found' }, { status: 404 });
    }

    const umkmId = umkm.id;

    const thirtyDaysAgo = getThirtyDaysAgo();

    // --- 2. QUERY KPI (Key Performance Indicators) ---
    // Kita hitung total pendapatan dan pesanan dari order yang sudah 'DELIVERED'
    const kpiData = await db.order.aggregate({
      where: {
        umkmId: umkmId,
        status: 'DELIVERED', // Hanya hitung pesanan yang selesai
        createdAt: { gte: thirtyDaysAgo }, // Dalam 30 hari terakhir
      },
      _sum: {
        totalAmount: true, // Total pendapatan (sesuai schema)
      },
      _count: {
        id: true, // Total pesanan
      },
    });

    // --- 2.1. HITUNG TOTAL COST (Modal/HPP) ---
    const orderItems = await db.orderItem.findMany({
      where: {
        order: {
          umkmId: umkmId,
          status: 'DELIVERED',
          createdAt: { gte: thirtyDaysAgo },
        },
      },
      include: {
        product: {
          select: {
            costPrice: true,
          },
        },
      },
    });

    // Hitung total modal berdasarkan costPrice * quantity
    let totalCost = 0;
    let totalProfit = 0;
    
    console.log('Dashboard OrderItems found:', orderItems.length);
    
    orderItems.forEach((item: any) => {
      const costPrice = item.product?.costPrice || 0;
      const sellingPrice = item.pricePerItem || 0;
      const quantity = item.quantity || 0;
      
      console.log(`Dashboard Item: ${item.productName}, CostPrice: ${costPrice}, SellingPrice: ${sellingPrice}, Quantity: ${quantity}`);
      
      totalCost += costPrice * quantity;
      totalProfit += (sellingPrice - costPrice) * quantity;
    });
    
    console.log('Dashboard Total Cost:', totalCost, 'Total Profit:', totalProfit);

    // Ambil rating rata-rata dari tabel UMKM (yang sudah auto-update)
    const umkmRating = await db.umkm.findUnique({
      where: { id: umkmId },
      select: { rating: true },
    });

    // --- 3. QUERY TOP PRODUK (Menu Terlaris) ---
    const topProducts = await db.orderItem.groupBy({
      by: ['productName'],
      where: {
        order: {
          umkmId: umkmId,
          status: 'DELIVERED',
          createdAt: { gte: thirtyDaysAgo },
        },
      },
      _sum: {
        quantity: true, // Jumlah total terjual
      },
      orderBy: {
        _sum: {
          quantity: 'desc', // Urutkan dari paling banyak
        },
      },
      take: 5, // Ambil 5 teratas
    });

    // --- 4. QUERY DATA GRAFIK (Pendapatan per Hari) ---
    // Ini adalah query mentah (Raw Query) PostgreSQL yang canggih
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
      ORDER BY date ASC
      LIMIT 7; 
    `;
    
    // Format data agar bisa dibaca oleh Recharts
    const salesData = salesDataRaw.map((d: { date: string; total: number }) => ({
      name: new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      Pendapatan: d.total,
    }));

    // --- 5. Gabungkan Semua Data & Kirim ---
    const responseData = {
      kpi: {
        totalRevenue: kpiData._sum.totalAmount || 0,
        totalCost: totalCost,
        totalProfit: totalProfit,
        profitMargin: kpiData._sum.totalAmount ? ((totalProfit / (kpiData._sum.totalAmount || 1)) * 100).toFixed(2) : "0.00",
        totalOrders: kpiData._count.id || 0,
        averageRating: umkmRating?.rating ? Number(umkmRating.rating) : 0,
      },
      topProducts: topProducts.map((p: any) => ({
        name: p.productName,
        sold: p._sum.quantity || 0,
      })),
      salesData: salesData,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data analytics' },
      { status: 500 }
    );
  }
}
