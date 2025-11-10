// Script untuk membuat data order test untuk testing analytics

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createTestOrder() {
  try {
    console.log("Creating test order for analytics...");

    // 1. Ambil user pertama (UMKM_OWNER)
    const umkmOwner = await prisma.user.findFirst({
      where: { role: 'UMKM_OWNER' }
    });

    if (!umkmOwner) {
      console.log("No UMKM owner found");
      return;
    }

    // 2. Ambil UMKM milik user tersebut
    const umkm = await prisma.umkm.findFirst({
      where: { ownerId: umkmOwner.id },
      include: {
        ProductCategory: {
          include: {
            Product: true
          }
        }
      }
    });

    if (!umkm || !umkm.ProductCategory[0]?.Product.length) {
      console.log("No UMKM or products found");
      return;
    }

    const products = umkm.ProductCategory[0].Product;
    console.log(`Found UMKM: ${umkm.name} with ${products.length} products`);

    // 3. Ambil customer untuk membeli
    const customer = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' }
    });

    if (!customer) {
      console.log("No customer found");
      return;
    }

    // 4. Buat beberapa order dengan status DELIVERED
    for (let i = 0; i < 3; i++) {
      const selectedProducts = products.slice(0, Math.min(2, products.length));
      let totalAmount = 0;
      const orderItems = [];

      for (const product of selectedProducts) {
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
        const itemTotal = (product.price || 0) * quantity;
        totalAmount += itemTotal;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          quantity: quantity,
          pricePerItem: product.price || 0
        });
      }

      // Create order
      const order = await prisma.order.create({
        data: {
          userId: customer.id,
          umkmId: umkm.id,
          status: 'DELIVERED',
          totalAmount: totalAmount,
          totalPrice: totalAmount,
          deliveryMethod: 'PICKUP',
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date within 7 days
        }
      });

      // Create order items
      for (const item of orderItems) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            pricePerItem: item.pricePerItem
          }
        });
      }

      console.log(`✅ Created order #${order.id} with total: Rp${totalAmount.toLocaleString()}`);
    }

    console.log("🎉 Test orders created successfully!");

  } catch (error) {
    console.error("❌ Error creating test orders:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrder();