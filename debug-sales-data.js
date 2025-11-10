// Debug script untuk melihat data grafik sales
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugSalesData() {
  try {
    // Ambil UMKM pertama
    const umkm = await prisma.umkm.findFirst({
      where: { ownerId: 'cmhdrquui0001fufjeej9x9db' } // User ID dari log
    });
    
    if (!umkm) {
      console.log('UMKM not found');
      return;
    }
    
    console.log('Found UMKM:', umkm.name);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Cek orders yang ada
    const orders = await prisma.order.findMany({
      where: {
        umkmId: umkm.id,
        status: 'DELIVERED',
        createdAt: { gte: thirtyDaysAgo }
      },
      select: {
        id: true,
        totalAmount: true,
        createdAt: true,
        status: true
      }
    });
    
    console.log('\nDelivered Orders in last 30 days:', orders.length);
    orders.forEach(order => {
      console.log(`Order ${order.id}: ${order.totalAmount} on ${order.createdAt.toISOString().split('T')[0]}`);
    });
    
    // Raw query untuk sales data
    const salesDataRaw = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        COALESCE(SUM("totalAmount"), 0)::integer as total
      FROM "Order"
      WHERE "umkmId" = ${umkm.id}
        AND "status" = 'DELIVERED'
        AND "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
      LIMIT 7; 
    `;
    
    console.log('\nRaw sales data:', salesDataRaw);
    
    // Format untuk Recharts
    const salesData = salesDataRaw.map((d) => ({
      name: new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      Pendapatan: d.total,
    }));
    
    console.log('\nFormatted sales data for chart:', salesData);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSalesData();