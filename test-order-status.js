// Test script untuk mengecek dan update status pesanan

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testOrderStatusUpdate() {
  try {
    console.log("=== Testing Order Status Update ===\n");

    // 1. Cek semua orders yang ada
    const allOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { name: true } },
        umkm: { select: { name: true } },
        items: {
          include: {
            product: { select: { name: true, costPrice: true } }
          }
        }
      }
    });

    console.log("📋 Recent Orders:");
    allOrders.forEach((order, i) => {
      console.log(`${i+1}. Order #${order.id} - Status: ${order.status} - UMKM: ${order.umkm.name}`);
      console.log(`   Customer: ${order.user.name} - Total: Rp${order.totalAmount || order.totalPrice}`);
      console.log(`   Items: ${order.items.length} items`);
      order.items.forEach(item => {
        const profit = item.product?.costPrice ? 
          (item.pricePerItem - item.product.costPrice) * item.quantity : 'N/A';
        console.log(`   - ${item.product?.name || item.productName}: ${item.quantity}x @ Rp${item.pricePerItem} (Profit: ${profit})`);
      });
      console.log("");
    });

    // 2. Update orders yang masih PENDING menjadi DELIVERED untuk testing analytics
    const pendingOrders = allOrders.filter(order => order.status === 'PENDING');
    
    if (pendingOrders.length > 0) {
      console.log(`\n🔄 Found ${pendingOrders.length} PENDING orders. Converting them to DELIVERED for analytics testing...\n`);
      
      for (const order of pendingOrders) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'DELIVERED' }
        });
        console.log(`✅ Order #${order.id} updated to DELIVERED`);
      }
    } else {
      console.log("\n✅ No PENDING orders found. All orders are already processed.");
    }

    // 3. Cek analytics data setelah update
    console.log("\n📊 Analytics Data After Update:");
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const analyticsData = await prisma.order.aggregate({
      where: {
        status: 'DELIVERED',
        createdAt: { gte: thirtyDaysAgo }
      },
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    console.log(`Total Revenue (30 days): Rp${analyticsData._sum.totalAmount || 0}`);
    console.log(`Total Orders (30 days): ${analyticsData._count.id || 0}`);

    // 4. Hitung profit
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
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
    
    orderItems.forEach((item) => {
      const costPrice = item.product?.costPrice || 0;
      const sellingPrice = item.pricePerItem;
      const quantity = item.quantity;
      
      totalCost += costPrice * quantity;
      totalProfit += (sellingPrice - costPrice) * quantity;
    });

    console.log(`Total Cost (HPP): Rp${totalCost}`);
    console.log(`Total Profit: Rp${totalProfit}`);
    
    const profitMargin = analyticsData._sum.totalAmount ? 
      ((totalProfit / analyticsData._sum.totalAmount) * 100).toFixed(2) : "0.00";
    console.log(`Profit Margin: ${profitMargin}%`);

    console.log("\n🎉 Order status update test completed!");

  } catch (error) {
    console.error("❌ Test FAILED:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testOrderStatusUpdate();