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

    // Cek role dari database untuk memastikan data terbaru
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });
    
    // Hanya pengusaha yang bisa akses analytics
    if (!user || (user.role !== 'PENGUSAHA' && session.user.role !== 'PENGUSAHA')) {
      return NextResponse.json({ error: 'Forbidden - Only PENGUSAHA allowed' }, { status: 403 });
    }

    // Cari UMKM berdasarkan user yang login
    const umkm = await db.umkm.findFirst({
      where: { ownerId: session.user.id }
    });

    if (!umkm) {
      return NextResponse.json({ error: 'UMKM not found' }, { status: 404 });
    }

    const umkmId = umkm.id;

    // --- 1.1. PARSE FILTER PERIODE ---
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30days'; // default 30 hari
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let dateFilter: { gte?: Date; lte?: Date } = {};
    
    if (startDate && endDate) {
      // Custom date range
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else {
      // Preset periods
      switch (period) {
        case 'today':
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          dateFilter = { gte: today };
          break;
        case '7days':
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          dateFilter = { gte: sevenDaysAgo };
          break;
        case '30days':
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          dateFilter = { gte: thirtyDaysAgo };
          break;
        case 'thisMonth':
          const thisMonth = new Date();
          thisMonth.setDate(1);
          thisMonth.setHours(0, 0, 0, 0);
          dateFilter = { gte: thisMonth };
          break;
        case 'thisYear':
          const thisYear = new Date();
          thisYear.setMonth(0, 1);
          thisYear.setHours(0, 0, 0, 0);
          dateFilter = { gte: thisYear };
          break;
        default:
          dateFilter = { gte: getThirtyDaysAgo() };
      }
    }

    // --- 2. QUERY KPI (Key Performance Indicators) ---
    // Kita hitung total pendapatan dan pesanan dari order yang sudah 'DELIVERED'
    const kpiData = await db.order.aggregate({
      where: {
        umkmId: umkmId,
        status: 'DELIVERED', // Hanya hitung pesanan yang selesai
        createdAt: dateFilter, // Berdasarkan periode yang dipilih
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
          createdAt: dateFilter,
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

    // Hitung rating rata-rata dari review aktual
    const reviewStats = await db.review.aggregate({
      where: { umkmId: umkmId },
      _avg: { rating: true },
      _count: { id: true },
    });

    // --- 3. QUERY TOP PRODUK (Menu Terlaris) ---
    const topProducts = await db.orderItem.groupBy({
      by: ['productName'],
      where: {
        order: {
          umkmId: umkmId,
          status: 'DELIVERED',
          createdAt: dateFilter,
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
    // Gunakan query Prisma biasa untuk lebih konsisten dengan filter
    const salesDataRaw = await db.order.groupBy({
      by: ['createdAt'],
      where: {
        umkmId: umkmId,
        status: 'DELIVERED',
        createdAt: dateFilter,
      },
      _sum: {
        totalAmount: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Format data agar bisa dibaca oleh Recharts
    const salesData = salesDataRaw.slice(-7).map((d: any) => ({
      name: new Date(d.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      Pendapatan: d._sum.totalAmount || 0,
    }));

    // --- 5. Gabungkan Semua Data & Kirim ---
    const responseData = {
      kpi: {
        totalRevenue: kpiData._sum.totalAmount || 0,
        totalCost: totalCost,
        totalProfit: totalProfit,
        profitMargin: kpiData._sum.totalAmount ? ((totalProfit / (kpiData._sum.totalAmount || 1)) * 100).toFixed(2) : "0.00",
        totalOrders: kpiData._count.id || 0,
        averageRating: reviewStats._avg.rating ? Number(reviewStats._avg.rating.toFixed(1)) : 0,
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
