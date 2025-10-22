const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const umkm = await prisma.umkm.findFirst({
      include: {
        Category: true,
        Product: true
      }
    });
    
    console.log('UMKM:', umkm.name);
    console.log('Products count:', umkm.Product.length);
    console.log('Products:', umkm.Product.map(p => p.name));
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();