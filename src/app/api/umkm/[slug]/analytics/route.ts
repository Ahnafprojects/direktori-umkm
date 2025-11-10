import { db } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// Helper untuk mendapatkan tanggal 30 hari yang lalu
function getThirtyDaysAgo() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date;
}

// Helper untuk mendapatkan tanggal 7 hari yang lalu  
function getSevenDaysAgo() {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const umkmId = parseInt(resolvedParams.slug);
    
    // Verifikasi bahwa user adalah owner UMKM ini
    const umkm = await db.umkm.findFirst({
      where: { 
        id: umkmId,
        ownerId: session.user.id 
      }
    });

    if (!umkm) {
      return NextResponse.json({ error: 'UMKM not found or access denied' }, { status: 404 });
    }

    const thirtyDaysAgo = getThirtyDaysAgo();
    const sevenDaysAgo = getSevenDaysAgo();

    // Query KPI data
    const kpiData = await db.order.aggregate({
      where: {
        umkmId: umkmId,
        status: 'DELIVERED',
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    // Hitung profit dengan costPrice
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

    let totalCost = 0;
    let totalProfit = 0;
    
    console.log('OrderItems found:', orderItems.length);
    
    orderItems.forEach((item: any) => {
      const costPrice = item.product?.costPrice || 0;
      const sellingPrice = item.pricePerItem || 0;
      const quantity = item.quantity || 0;
      
      console.log(`Item: ${item.productName}, CostPrice: ${costPrice}, SellingPrice: ${sellingPrice}, Quantity: ${quantity}`);
      
      totalCost += costPrice * quantity;
      totalProfit += (sellingPrice - costPrice) * quantity;
    });
    
    console.log('Total Cost:', totalCost, 'Total Profit:', totalProfit);

    // Query top products
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
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 3,
    });

    // Query recent activity
    const newOrders = await db.order.count({
      where: {
        umkmId: umkmId,
        createdAt: { gte: sevenDaysAgo },
      },
    });

    const newReviews = await db.review.count({
      where: {
        umkmId: umkmId,
        createdAt: { gte: sevenDaysAgo },
      },
    });

    // Query sales data untuk grafik (30 hari terakhir untuk dapat data yang ada)
    console.log('Querying sales data for UMKM:', umkmId, 'from date:', thirtyDaysAgo);
    
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
    
    console.log('Sales data raw from DB:', salesDataRaw);
    
    // Format data untuk Recharts
    const salesData = salesDataRaw.map((d: { date: string; total: number }) => ({
      name: new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      Pendapatan: d.total,
    }));

    console.log('Sales data formatted for chart:', salesData);

    const responseData = {
      kpi: {
        totalRevenue: kpiData._sum.totalAmount || 0,
        totalCost: totalCost,
        totalProfit: totalProfit,
        profitMargin: kpiData._sum.totalAmount ? ((totalProfit / (kpiData._sum.totalAmount || 1)) * 100).toFixed(2) : "0.00",
        totalOrders: kpiData._count.id || 0,
        averageRating: umkm.rating ? Number(umkm.rating) : 0,
      },
      topProducts: topProducts.map((p: any) => ({
        name: p.productName,
        sold: p._sum.quantity || 0,
      })),
      salesData: salesData, // Tambahkan sales data untuk grafik
      recentActivity: {
        newReviews: newReviews,
        newOrders: newOrders,
      },
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error fetching UMKM analytics:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data analytics' },
      { status: 500 }
    );
  }
}