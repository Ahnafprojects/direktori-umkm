// Test script untuk memverifikasi field costPrice sudah ditambahkan dengan benar

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testCostPrice() {
  try {
    console.log("Testing costPrice field implementation...");

    // 1. Test - Ambil produk yang ada untuk melihat schema
    const products = await prisma.product.findMany({
      take: 5,
      include: {
        ProductCategory: {
          include: {
            Umkm: true
          }
        }
      }
    });

    console.log("Sample products with costPrice field:");
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}:`);
      console.log(`   - Price (Harga Jual): ${product.price}`);
      console.log(`   - CostPrice (Harga Beli): ${product.costPrice || 'null'}`);
      console.log(`   - UMKM: ${product.ProductCategory.Umkm.name}`);
      console.log("");
    });

    // 2. Test - Update produk untuk menambahkan costPrice
    if (products.length > 0) {
      const testProduct = products[0];
      const updatedProduct = await prisma.product.update({
        where: { id: testProduct.id },
        data: {
          costPrice: Math.floor(testProduct.price * 0.7) // Set costPrice sebagai 70% dari harga jual
        }
      });

      console.log(`✅ Updated product "${updatedProduct.name}"`);
      console.log(`   - Price: ${updatedProduct.price}`);
      console.log(`   - CostPrice: ${updatedProduct.costPrice}`);
      console.log(`   - Profit: ${updatedProduct.price - updatedProduct.costPrice}`);
      console.log("");
    }

    // 3. Test - Create produk baru dengan costPrice
    const testCategory = await prisma.productCategory.findFirst();
    if (testCategory) {
      const newProduct = await prisma.product.create({
        data: {
          name: "Test Product With CostPrice",
          description: "Testing costPrice field",
          price: 25000,
          costPrice: 15000,
          productCategoryId: testCategory.id
        }
      });

      console.log(`✅ Created new test product:`);
      console.log(`   - Name: ${newProduct.name}`);
      console.log(`   - Price: ${newProduct.price}`);
      console.log(`   - CostPrice: ${newProduct.costPrice}`);
      console.log(`   - Profit: ${newProduct.price - newProduct.costPrice}`);
      console.log("");

      // Hapus produk test
      await prisma.product.delete({
        where: { id: newProduct.id }
      });
      console.log("✅ Test product cleaned up");
    }

    console.log("🎉 costPrice field implementation test PASSED!");

  } catch (error) {
    console.error("❌ Test FAILED:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testCostPrice();