// Script untuk mengisi costPrice untuk semua produk yang null
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
});

async function fillCostPrices() {
  try {
    console.log('🔍 Mencari produk dengan costPrice null...');
    
    // Ambil semua produk yang costPrice-nya null
    const productsWithoutCostPrice = await prisma.product.findMany({
      where: {
        costPrice: null,
        price: {
          not: null // Pastikan ada harga jual
        }
      },
      select: {
        id: true,
        name: true,
        price: true,
        costPrice: true
      }
    });

    console.log(`📊 Ditemukan ${productsWithoutCostPrice.length} produk tanpa costPrice`);

    if (productsWithoutCostPrice.length === 0) {
      console.log('✅ Semua produk sudah memiliki costPrice!');
      return;
    }

    // Update setiap produk dengan costPrice = 70% dari harga jual
    // (asumsi margin keuntungan 30%)
    const updates = [];
    
    for (const product of productsWithoutCostPrice) {
      const costPrice = Math.round(product.price * 0.7); // 70% dari harga jual
      updates.push(
        prisma.product.update({
          where: { id: product.id },
          data: { costPrice: costPrice }
        })
      );
      
      console.log(`📝 ${product.name}: Harga Jual Rp${product.price.toLocaleString('id-ID')} → Harga Beli Rp${costPrice.toLocaleString('id-ID')}`);
    }

    // Execute all updates
    await Promise.all(updates);
    
    console.log(`✅ Berhasil update ${productsWithoutCostPrice.length} produk!`);
    
    // Verifikasi hasil
    const remainingNull = await prisma.product.count({
      where: { costPrice: null }
    });
    
    console.log(`📈 Sisa produk dengan costPrice null: ${remainingNull}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan script
fillCostPrices();