const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    // Test include dengan Product
    const umkm = await prisma.umkm.findFirst({
      include: {
        Category: true,
        Product: true,
      }
    });
    console.log('Success dengan Product:', umkm ? 'OK' : 'No data');
  } catch (error) {
    console.log('Error dengan Product:', error.message);
    
    try {
      // Test dengan products
      const umkm2 = await prisma.umkm.findFirst({
        include: {
          Category: true,
          products: true,
        }
      });
      console.log('Success dengan products:', umkm2 ? 'OK' : 'No data');
    } catch (error2) {
      console.log('Error dengan products:', error2.message);
    }
  }
  
  await prisma.$disconnect();
}

test();