// Quick DB Test
const { db } = require('./src/lib/prisma.ts');

async function quickTest() {
  console.log('🔄 Testing database...');
  
  try {
    // Test basic connection
    const count = await db.umkm.count();
    console.log(`✅ Database connected! ${count} UMKM found`);
    
    // Test specific query like AI Assistant uses
    const sample = await db.umkm.findFirst({
      include: {
        Category: true,
        Review: { take: 1 },
        _count: { select: { favorites: true, Review: true } }
      }
    });
    
    console.log(`✅ Sample UMKM: ${sample?.name}`);
    console.log(`✅ Category: ${sample?.Category.name}`);
    console.log(`✅ Favorites: ${sample?._count.favorites}`);
    console.log(`✅ Reviews: ${sample?._count.Review}`);
    
    await db.$disconnect();
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

quickTest();