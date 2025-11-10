// Script untuk verifikasi costPrice sudah terisi
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
});

async function verifyCostPrices() {
  try {
    console.log('🔍 Verifikasi data costPrice...\n');
    
    // Ambil beberapa produk untuk verifikasi
    const products = await prisma.product.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        price: true,
        costPrice: true
      },
      orderBy: {
        id: 'asc'
      }
    });

    console.log('📊 Sample data produk:');
    console.log('='.repeat(80));
    console.log('| No | Nama Produk                    | Harga Jual | Harga Beli | Margin |');
    console.log('='.repeat(80));
    
    products.forEach((product, index) => {
      const margin = product.costPrice ? 
        (((product.price - product.costPrice) / product.price) * 100).toFixed(1) + '%' : 
        'N/A';
      
      const name = product.name.length > 30 ? 
        product.name.substring(0, 27) + '...' : 
        product.name;
        
      console.log(
        `| ${(index + 1).toString().padStart(2)} | ${name.padEnd(30)} | ${product.price.toLocaleString('id-ID').padStart(10)} | ${product.costPrice ? product.costPrice.toLocaleString('id-ID').padStart(10) : 'NULL'.padStart(10)} | ${margin.padStart(6)} |`
      );
    });
    
    console.log('='.repeat(80));
    
    // Statistik keseluruhan
    const totalProducts = await prisma.product.count();
    const productsWithCostPrice = await prisma.product.count({
      where: {
        costPrice: {
          not: null
        }
      }
    });
    
    const productsWithoutCostPrice = totalProducts - productsWithCostPrice;
    
    console.log(`\n📈 Statistik:`);
    console.log(`   Total Produk: ${totalProducts}`);
    console.log(`   Dengan CostPrice: ${productsWithCostPrice}`);
    console.log(`   Tanpa CostPrice: ${productsWithoutCostPrice}`);
    console.log(`   Persentase Lengkap: ${((productsWithCostPrice / totalProducts) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan script
verifyCostPrices();