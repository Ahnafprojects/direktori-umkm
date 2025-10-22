const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testQuery() {
  try {
    console.log('Testing query with Product include...');
    
    const umkms = await prisma.umkm.findMany({
      include: {
        Category: true,
        Product: { 
          where: { isFeatured: true },
          take: 2,
        },
      },
      take: 2
    });
    
    console.log('Found', umkms.length, 'UMKMs');
    
    umkms.forEach(umkm => {
      console.log('\nUMKM:', umkm.name);
      console.log('Category:', umkm.Category.name);
      console.log('Products:', umkm.Product.length);
      umkm.Product.forEach(product => {
        console.log('  -', product.name, '(featured:', product.isFeatured, ')');
      });
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

testQuery();